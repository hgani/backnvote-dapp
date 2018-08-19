class AddNetworkToVotingContracts < ActiveRecord::Migration[5.1]
  def change
    add_column :voting_contracts, :network, :integer, null: false, default: 0, index: true
  end
end