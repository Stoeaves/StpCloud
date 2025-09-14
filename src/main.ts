import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import router from './router';

// SweetAlert
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// 加入字体资源
library.add(fas);

const app = createApp(App);
app.use(router);
app.use(VueSweetalert2);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
