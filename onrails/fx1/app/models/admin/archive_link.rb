class Admin::ArchiveLink < ActiveRecord::Base
  has_one :xampp_version
  NUMBER = /\A[^0]{1}[0-9]{1,3}\z/
  validates :bits, presence:true, format: {with: NUMBER}
end
