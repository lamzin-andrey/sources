class Admin::XamppVersion < ActiveRecord::Base
  has_many :archive_links
  PRODUCT_VERSION_VALID = /\A[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(\-[0-9]{1,3})?\z/
  validates :xampp_version, presence: true, format: {with: PRODUCT_VERSION_VALID}
  validates :apache_version, presence: true, format: {with: PRODUCT_VERSION_VALID}
  validates :php_version, presence: true, format: {with: PRODUCT_VERSION_VALID}
  validates :mysql_client_version, presence: true, format: {with: PRODUCT_VERSION_VALID}
  validates :mysql_server_version, presence: true, format: {with: PRODUCT_VERSION_VALID}
end
