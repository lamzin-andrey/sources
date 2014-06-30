json.array!(@admin_archive_links) do |admin_archive_link|
  json.extract! admin_archive_link, :id, :bits, :link_full, :link_light
  json.url admin_archive_link_url(admin_archive_link, format: :json)
end
