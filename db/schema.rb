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

ActiveRecord::Schema.define(version: 20180728030356) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "voting_contracts", force: :cascade do |t|
    t.string "address"
    t.string "tx_hash", null: false
    t.string "creator", null: false
    t.string "label"
    t.string "description"
    t.string "options"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "network", default: 0, null: false
    t.index ["address"], name: "index_voting_contracts_on_address"
    t.index ["tx_hash"], name: "index_voting_contracts_on_tx_hash"
  end

end
