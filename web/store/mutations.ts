/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-10 07:43:00
 */

import { State } from 'vue';
import { Label, Post } from '@web/__interface';
import { CREATE_LABEL, CREATE_POST, UPDATE_POST, UPDATE_ACTIVE_FOLDER } from './types';

export default {
    [CREATE_LABEL](state: State, label: Label) {
        state.labels.push(label);
    },
    [CREATE_POST](state: State, post: Post) {
        state.posts.unshift(post);
    },
    [UPDATE_POST](state: State, [post, data]: [Post, any]) {
        Object.assign(post, data);
    },
    [UPDATE_ACTIVE_FOLDER](state: State, id: string) {
        state.activeFolder = id;
    },
};
