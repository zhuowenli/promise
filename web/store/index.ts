/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 14:31:00
 */
import { createStore } from 'vuex';

import { Folder } from '@web/__interface';
import * as getters from './getters';
import * as actions from './actions';
import mutations from './mutations';
import createPersistedState from './plugins/persisted-state';

const state = {
    labels: [],
    posts: [],
    folders: [] as Folder[],
    smartGroups: [],
    activeFolder: 'all', // uncategorized、trash
    setting: {
        markdown: {
            enable: true,
            width: 200,
        },
    },
};

const store = createStore({
    state,
    getters,
    actions,
    mutations,
    plugins: [
        createPersistedState(),
    ],
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
