/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-10 07:42:42
 */

import { State } from 'vue';

export const labels = (state: State) => state.labels;
export const setting = (state: State) => state.setting;
export const posts = (state: State) => {
    if (state.activeFolder === 'all') {
        return state.posts.filter(item => item.from !== 'trash');
    }
    if (state.activeFolder === 'uncategorized') {
        return state.posts.filter(item => item.from === '');
    }
    return state.posts.filter(item => item.from === state.activeFolder);
};
