import Vue from 'vue';
import Buefy from 'buefy';
import io from 'socket.io-client';
import VueHighlightJS from 'vue-highlight.js';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/default.css';
/* eslint-disable */
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import brands from '@fortawesome/fontawesome-free-brands';
/* eslint-enable */
import App from './App';
import i18n from './i18n';
import store from './store';
import router from './router';
import VueSocket from './sockets/vue-socket';
import VueTreeView from './tree-view/vue-tree-view';

Vue.config.productionTip = false;
Vue.use(Buefy);
Vue.use(VueTreeView);
Vue.use(VueSocket, { io, store });
Vue.use(VueHighlightJS, { languages: { sql } });

/* eslint-disable no-new */
new Vue({
    el: '#app',
    i18n,
    store,
    router,
    render: h => h(App),
});
