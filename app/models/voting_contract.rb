class VotingContract < ApplicationRecord
  # Chain ID: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
  enum network: {main: 1, ropsten: 3, rinkeby: 4, kovan: 42}

  validates :tx_hash, presence: true
  validates :creator, presence: true
end