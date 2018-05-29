import _ from 'lodash';
import Vue from 'vue/dist/vue.esm';
import VueRouter from 'vue-router';
import web3Helper from 'web3-helper';
import utils from '../utils';
import votingContract from '../voting-contract';

import NoMetaMask from '../components/no-metamask';
import TopMenu from '../components/top-menu';
import SideMenu from '../components/side-menu';
import App from '../components/app';
import NotFound from '../components/not-found';
import Voting from '../components/voting';
import VotingForm from '../components/voting-form';
import Votings from '../components/votings';
import VotingsShow from '../components/votings-show';
import VotingsNew from '../components/votings-new';
import VotingsEdit from '../components/votings-edit';

const web3 = global.web3;

$(() => {
  web3Helper.checkMetamask(4);

  toastr.options.positionClass = 'toast-top-center';
  window.ttr = toastr;
  const csrfToken = $("meta[name=csrf-token]").attr("content");

  Vue.use(VueRouter);

  // register components
  Vue.component('top-menu', TopMenu);
  Vue.component('side-menu', SideMenu);
  Vue.component('voting', Voting);
  Vue.component('voting-form', VotingForm);

  global.vm = new Vue({
    el: '#vueRoot',
    router: new VueRouter({
      routes: [{
        path: '/',
        component: web3 ? App : NoMetaMask,
        props: {
          web3,
          web3Helper
        },
        children: [{
            path: '',
            component: {
              template: '<div class="h1 jumbotron text-center">Voting App</div>'
            }
          },
          {
            path: 'not-found',
            component: NotFound
          },
          {
            path: 'votings',
            component: Votings,
            props: {
              web3,
              web3Helper,
              votingContract
            }
          },
          {
            path: 'votings/:address(0x\\w+)',
            component: VotingsShow,
            props: {
              web3,
              web3Helper,
              votingContract
            }
          },
          {
            path: 'votings/new',
            component: VotingsNew,
            props: {
              web3,
              web3Helper,
              votingContract,
              csrfToken
            }
          },
          {
            path: 'votings/:address/edit',
            component: VotingsEdit,
            props: {
              web3,
              web3Helper,
              votingContract,
              csrfToken
            }
          }
        ]
      }]
    })
  });
});