import web3Helper from 'web3-helper';

//When object depth more than 2, then reactivity not work well.
const store = {
  network: null,
  etherScanRoot: null
};

export default store;

setInterval(() => {
  web3Helper.getNetwork((err, net) => {
    if (err) throw err;

    store.network = net;
    store.etherScanRoot = etherScanRoot(net);
  });
}, 1000);

function etherScanRoot(network) {
  switch (network) {
    case "main":
      return "https://etherscan.io";
    case "ropsten":
      return "https://ropsten.etherscan.io";
    case "rinkeby":
      return "https://rinkeby.etherscan.io";
    case "kovan":
      return "https://kovan.etherscan.io";
  }
}