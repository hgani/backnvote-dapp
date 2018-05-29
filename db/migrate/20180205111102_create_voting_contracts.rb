class CreateVotingContracts < ActiveRecord::Migration[5.1]
  def change
    create_table :voting_contracts do |t|
      t.string :address, index: true
      t.string :tx_hash, null: false, index: true
      t.string :creator, null: false
      t.string :label
      t.string :description
      t.string :options

      t.timestamps
    end
  end
end
