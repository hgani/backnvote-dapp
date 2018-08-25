import web3Helper from 'web3-helper';

export default {
  validateVotingForm(voting, cb) {
    this.ensureLogin((err) => {
      if (err) {
        return cb(err);
      }

      if (!voting.label) {
        return ttr.error("Please enter valid label");
      }

      for (const item of voting.options) {
        if (!item) {
          return ttr.error("Please enter valid option")
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
    if (!web3.eth.defaultAccount) {
      alert("Please login to MetaMask");
      return cb('Metamask has no default account');
    }
    return cb();
  }
}