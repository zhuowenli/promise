/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 14:31:00
 */
import { createStore } from 'vuex';

import * as getters from './getters';
import * as actions from './actions';
import mutations from './mutations';

const state = {
    labels: [],
    posts: [],
    folders: [],
    groups: [],
};

const store = createStore({
    state,
    getters,
    actions,
    mutations,
});

if (module.hot) {
    module.hot.accept([
        './getters',
        './actions',
        './mutations',
    ], () => {
        store.hotUpdate({
            getters: require('./getters'),
            actions: require('./actions'),
            mutations: require('./mutations'),
        });
    });
}

export default store;
