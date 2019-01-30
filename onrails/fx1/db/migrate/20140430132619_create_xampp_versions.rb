class CreateXamppVersions < ActiveRecord::Migration
  def change
	drop_table :xampp_versions
    create_table :xampp_versions do |t|
	  t.column :xampp_version, :string
	  t.column :apache_version, :string
	  t.column :mysql_client_version, :string
	  t.column :mysql_server_version, :string
	  t.column :php_version, :string
      t.timestamps
    end
  end
end
