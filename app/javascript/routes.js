import App from './components/app';
import NotFound from './components/not-found';
import Votings from './components/votings';
import VotingsShow from './components/votings-show';
import VotingsNew from './components/votings-new';
import VotingsEdit from './components/votings-edit';
import UserProjects from './components/user-projects';
import UserBackedProjects from './components/user-backed-projects';

export default function () {
  const csrfToken = $("meta[name=csrf-token]").attr("content");

  return {
    linkExactActiveClass: 'active',
    routes: [{
      path: '/',
      component: App,
      children: [{
          path: '',
          redirect: 'votings',
          component: {
            template: '<div class="h1 jumbotron text-center">Voting App</div>'
          }
        },
        {
          path: 'not-found',
          component: NotFound
        },
        {
          name: 'votings',
          path: 'votings',
          component: Votings
        },
        {
          path: 'votings/:address(0x\\w+)',
          component: VotingsShow
        },
        {
          name: 'votingsNew',
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
          name: 'userProjects',
          path: 'users/:address/projects',
          component: UserProjects
        },
        {
          name: 'userBackedProjects',
          path: 'users/:address/backed_projects',
          component: UserBackedProjects
        }
      ]
    }]
  }
}