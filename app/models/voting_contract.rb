class VotingContract < ApplicationRecord
  validates :tx_hash, presence: true
  validates :creator, presence: true
end