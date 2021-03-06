/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 14:29:25
 */

import { ComponentCustomProperties } from 'vue';
import { Store } from 'vuex';
import { Post, Label, Folder, Group } from '@web/__interface';

declare module '@vue/runtime-core' {
    interface State {
        labels: Label[]
        posts: Post[]
        folders: Folder[],
        smartGroups: Group[],
        activeFolder: string,
        setting: {
            markdown: {
                enable: boolean
                width: number
            }
        },
    }

    interface VuexStore extends Store<State> {
        originalCommit?: VuexStore.commit
        originalDispatch?: VuexStore.dispatch
    }

    interface ComponentCustomProperties {
        $store: Store<State>
    }
}
