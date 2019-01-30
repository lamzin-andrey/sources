class CreateArchiveLinks < ActiveRecord::Migration
  def change
    create_table :archive_links do |t|
		t.column :xampp_version_id, :integer
		t.column :bits, :integer
		t.column :link_full, :string
		t.column :link_light, :string
    end
  end
end
