json.array!(@admin_xampp_versions) do |admin_xampp_version|
  json.extract! admin_xampp_version, :id
  json.url admin_xampp_version_url(admin_xampp_version, format: :json)
end
