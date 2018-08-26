import web3Helper from 'web3-helper';

const infuraNodes = {
  mainnet: 'https://mainnet.infura.io/v3',
  ropsten: 'https://ropsten.infura.io/v3',
  kovan: 'https://kovan.infura.io/v3',
  rinkeby: 'https://rinkeby.infura.io/v3'
}

export default {
  emptyAddress: '0x0000000000000000000000000000000000000000',
  infuraNodes,
  validateVotingForm(voting, cb) {
    this.ensureLogin((err) => {
      if (err) {
        return cb(err);
      }

      if (!voting.label) {
        return ttr.error("Please enter valid question");
      }

      for (const item of voting.options) {
        if (!item) {
          return ttr.error("Please enter valid choice")
        };
      }

      return cb && cb();
    })
  },
  deployContract(Contract, byteCode, params, options, cb) {
    this.ensureLogin((err) => {
      if (err) {
        return cb(err);
      }

      web3Helper.deployContract(Contract, byteCode, params, options, cb);
    })
  },
  submitTx(contract, method, params, options, cb) {
    this.ensureLogin((err) => {
      if (err) {
        return cb(err);
      }

      web3Helper.submitTx(contract, method, params, options, cb);
    })
  },
  ensureLogin(cb) {
    if (!web3.currentProvider.isMetaMask) {
      alert("Please install MetaMask");
      return cb('No Metamask');
    }

    if (web3.currentProvider.isMetaMask && !web3.eth.defaultAccount) {
      alert("Please login to Metamask");
      return cb('Metamask has no default account');
    }

    return cb();
  }
}