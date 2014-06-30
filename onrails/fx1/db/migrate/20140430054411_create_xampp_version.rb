class CreateXamppVersion < ActiveRecord::Migration
  def change
    create_table :xampp_versions do |t|
		t.column :xampp_version, :string
		t.column :apache_version, :string
		t.column :mysql_client_version, :string
		t.column :mysql_server_version, :string
		t.column :php_version, :string
    end
  end
end
