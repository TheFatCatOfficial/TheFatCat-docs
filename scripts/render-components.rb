# Expand documentation components with the same Liquid engine as the website.
require "jekyll"
require "json"

Jekyll.logger.log_level = :error
site = Jekyll::Site.new(Jekyll.configuration("source" => ARGV.fetch(0), "quiet" => true))
site.read
pages = site.pages.to_h { |page| [page.relative_path, page] }
rendered = JSON.parse($stdin.read).to_h do |path, content|
  page = pages.fetch(path)
  payload = site.site_payload
  payload["page"] = page.to_liquid
  info = {
    :registers => { :site => site, :page => payload["page"] },
    :strict_filters => site.config.dig("liquid", "strict_filters"),
    :strict_variables => site.config.dig("liquid", "strict_variables"),
  }
  renderer = Jekyll::Renderer.new(site, page)
  [path, renderer.render_liquid(content, payload, info, path)]
end
puts JSON.generate(rendered)
