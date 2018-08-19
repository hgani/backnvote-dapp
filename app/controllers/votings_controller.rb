class VotingsController < ApplicationController
  def index
    network = VotingContract.networks[params[:network]]
    votings = VotingContract.where(network: network).where.not(address: nil).order(created_at: :desc)
    respond_to do |format|
      format.json do
        render(json: { votings: votings, pagination: {} })
      end
    end
  end

  def show
    network = VotingContract.networks[params[:network]]
    voting = VotingContract.where(network: network).where('lower(address) = lower(?)', params[:id]).first
    respond_to do |format|
      format.json do
        render(json: { voting: voting })
      end
    end
  end

  def create
    respond_to do |format|
      format.json do
        network = VotingContract.networks[params[:network]]
        tx_hash = params[:tx_hash]
        creator = params[:creator]
        label = params[:label]
        description = params[:description]
        options = params[:options]

        voting = VotingContract.create(
          network: network,
          tx_hash: tx_hash,
          creator: creator,
          label: label,
          description: description,
          options: options
        )
        voting.save!
      end
    end
  end

  def update
    network = VotingContract.networks[params[:network]]
    voting = VotingContract.find_by(network: network, address: params[:id])

    respond_to do |format|
      format.json do
        voting.label = params[:label]
        voting.description = params[:description]
        voting.options = params[:options]

        voting.save!
      end
    end
  end
end
