export default {
  validateVotingForm(voting, cb) {
    if (!web3Helper.metamaskLogin()) {
      return alert("Please login to MetaMask");
    }

    if (!voting.label) return ttr.error("Please enter valid label");
    for (const item of voting.options) {
      if (!item) return ttr.error("Please enter valid option");
    }

    return cb && cb();
  }
}