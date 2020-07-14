/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-12 16:50:42
 */
import { ActionContext } from 'vuex';
import { State } from 'vue';
import { monaco } from '@components/editor-instance';

export type Action = ActionContext<State, State>;

export interface Label {
    id: number
    label: string
};

export interface Post {
    id: string
    title: string
    language: string
    note?: string
    position: monaco.IPosition
    labels: Label[]
    model: monaco.editor.ITextModel
    createAt: Date
    updateAt: Date
}
