import _ from 'lodash';
import Vue from 'vue/dist/vue.esm';
import VueRouter from 'vue-router';
import web3Helper from 'web3-helper';

import VueProgressBar from 'vue-progressbar';
import AjaxStatus from '../components/ajax-status';
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
import User from '../components/user';

global.web3Helper = web3Helper;

$(() => {
  web3Helper.checkMetamask(4);

  toastr.options.positionClass = 'toast-top-center';
  window.ttr = toastr;
  const csrfToken = $("meta[name=csrf-token]").attr("content");

  Vue.use(VueRouter);
  Vue.use(VueProgressBar, {
    autoFinish: false
  });

  // register components
  Vue.component('ajax-status', AjaxStatus);
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
            component: Votings
          },
          {
            path: 'votings/:address(0x\\w+)',
            component: VotingsShow
          },
          {
            path: 'votings/new',
            component: VotingsNew,
            props: {
              csrfToken
            }
          },
          {
            path: 'votings/:address/edit',
            component: VotingsEdit,
            props: {
              csrfToken
            }
          },
          {
            path: 'users/:address',
            component: User
          }
        ]
      }]
    })
  });
});