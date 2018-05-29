class VotingsController < ApplicationController
  def index
    #votings = VotingContract.where.not(address: nil).order(created_at: :desc)
    votings = VotingContract.order(created_at: :desc)
    respond_to do |format|
      format.json do
        render(json: { votings: votings, pagination: {} })
      end
    end
  end

  def show
    voting = VotingContract.where('lower(address) = lower(?)', params[:id]).first
    respond_to do |format|
      format.json do
        render(json: { voting: voting })
      end
    end
  end

  def create
    respond_to do |format|
      format.json do
        tx_hash = params[:tx_hash]
        creator = params[:creator]
        label = params[:label]
        description = params[:description]
        options = params[:options]

        voting = VotingContract.create(
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
    voting = VotingContract.find_by(address: params[:id])

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
