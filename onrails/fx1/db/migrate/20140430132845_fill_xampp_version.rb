class FillXamppVersion < ActiveRecord::Migration
  def change
	XamppVersion.create :xampp_version => '1.7.4',
		:apache_version => '2.2.17',
		:mysql_server_version => '5.5.8',
		:mysql_client_version => '5.0.7',
		:php_version => '5.3.5'
		
	XamppVersion.create :xampp_version => '1.8.3-3',
		:apache_version => '2.4.7',
		:mysql_server_version => '5.6.16',
		:mysql_client_version => '5.0.11',
		:php_version => '5.5.9'
  end
end
