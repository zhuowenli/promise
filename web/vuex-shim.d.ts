/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 14:29:25
 */

import { ComponentCustomProperties } from 'vue';
import { Store } from 'vuex';
import { Label } from './store/types';

declare module '@vue/runtime-core' {
    interface State {
        count: number
        labels: Label[]
    }

    interface ComponentCustomProperties {
        $store: Store<State>
    }
}
