import _ from 'lodash';
import Vue from 'vue/dist/vue.esm';
import VueRouter from 'vue-router';
import Web3 from 'web3';
import web3Helper from 'web3-helper';

import utils from '../utils';
import routes from '../routes';
import VueProgressBar from 'vue-progressbar';
import Confirm from '../components/confirm';
import AjaxStatus from '../components/ajax-status';
import WalletInfo from '../components/wallet-info';
import TopMenu from '../components/top-menu';
import SideMenu from '../components/side-menu';
import Voting from '../components/voting';
import ConfirmVote from '../components/voting/confirm-vote';
import VotingForm from '../components/voting-form';

const RINKEBY_API_KEY = '707e82ccca0749f39eac588f2a309d79';

if (!window.web3) {
  let node = localStorage.getItem('voting:node');

  if (!node) {
    node = 'rinkeby';
    localStorage.setItem('voting:node', node);
  }

  window.web3 = new Web3(new Web3.providers.HttpProvider(`${utils.infuraNodes[node]}/${RINKEBY_API_KEY}`));
}

global.web3Helper = web3Helper;

$(() => {
  toastr.options.positionClass = 'toast-top-center';
  window.ttr = toastr;

  Vue.use(VueRouter);
  Vue.use(VueProgressBar, {
    autoFinish: false
  });

  // register components
  Vue.component('ajax-status', AjaxStatus);
  Vue.component('confirm', Confirm);
  Vue.component('wallet-info', WalletInfo);
  Vue.component('top-menu', TopMenu);
  Vue.component('side-menu', SideMenu);
  Vue.component('voting', Voting);
  Vue.component('confirm-vote', ConfirmVote);
  Vue.component('voting-form', VotingForm);

  global.vm = new Vue({
    el: '#vueRoot',
    router: new VueRouter(routes())
  });
});