/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 10:12:17
 */

import { createApp } from 'vue';

import App from './App.vue';
import store from './store';

const app = createApp(App);

// if (!process.env.IS_WEB) app.use(require('vue-electron'));

app.use(store);
app.mount('#app');

// @ts-ignore
// window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app.constructor;

export default app;
