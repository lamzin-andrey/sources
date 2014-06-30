# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140520083014) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "archive_links", force: true do |t|
    t.integer "xampp_version_id"
    t.integer "bits"
    t.string  "link_full"
    t.string  "link_light"
  end

  create_table "users", force: true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "password_digest"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree

  create_table "xampp_versions", force: true do |t|
    t.string   "xampp_version"
    t.string   "apache_version"
    t.string   "mysql_client_version"
    t.string   "mysql_server_version"
    t.string   "php_version"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
