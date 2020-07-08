/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 14:29:25
 */

// import { ComponentCustomProperties } from 'vue';
// import { Store } from 'vuex';

declare module '@vue/runtime-core' {
    interface State {
        count: number
    }

    interface ComponentCustomProperties {
        $store: Store<State>
    }
}
