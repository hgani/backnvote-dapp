class GetContractAddresses
  include Sidekiq::Worker
  include EthHelper

  def perform
    votings = VotingContract.where(address: nil)
    votings.each do |voting|
      receipt = Eth::client.eth_get_transaction_receipt(voting.tx_hash)['result']
      voting.address = receipt['contractAddress']
      voting.save
    end
  end
end
