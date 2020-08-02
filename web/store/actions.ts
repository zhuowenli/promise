/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-10 07:42:51
 */

import findOne from '@services/find-one';
import { Post, Label, Action, Folder } from '@web/__interface';
import { generateId } from '@services/utils';
import { CREATE_LABEL, CREATE_POST, CREATE_FOLDER } from './types';

/**
 * 新建标签
 *
 * @export
 * @param {Action} { commit, state }
 * @param {string} label
 * @returns {Label}
 */
export function createLabelByName({ commit, state }: Action, label: string): Label {
    const { result } = findOne(state.labels, { label });
    if (result) return result;

    const id = state.labels.length ? state.labels[state.labels.length - 1].id + 1 : 1;
    const data = { label, id };
    commit(CREATE_LABEL, data);
    return data;
};

/**
 * 创建文章
 *
 * @export
 * @param {Action} { commit }
 * @param {Post} post
 */
export function createPost({ commit }: Action, from = ''): Post {
    const data = {
        id: generateId(),
        title: '',
        from,
        note: '',
        position: { lineNumber: 1, column: 1 },
        content: '',
        createAt: new Date(),
        updateAt: new Date(),
        labels: [],
        language: 'markdown',
    };
    commit(CREATE_POST, data);
    return data;
}

/**
 * 创建文件夹
 *
 * @export
 * @param {Action} {commit}
 */
export function createFolder({ commit }: Action): Folder {
    const data = {
        id: generateId(),
        name: '未命名文件夹',
    };
    commit(CREATE_FOLDER, data);
    return data;
}
