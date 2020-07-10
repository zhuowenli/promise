/*
 * @Author: 卓文理
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-02-14 16:52:26
 */

import { Emitter, Handler } from 'mitt';
import { defineComponent } from 'vue';

const emitter: Emitter = mitt();

export default defineComponent({
    methods: {
        dispatch<T>(componentName: string, eventName: string, params: T) {
            let parent = this.$parent || this.$root;

            if (!parent) return;

            let name = parent.$options.componentName;

            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.componentName;
                }
            }

            if (parent) {
                emitter.emit(eventName, { componentName, params });
            }
        },

        broadcast<T>(componentName: string, eventName: string, params: T) {
            emitter.emit(eventName, { componentName, params });
        },

        $on(eventName: string, handler: Handler) {
            const name = this.$options.componentName;

            emitter.on(eventName, event => {
                if (event.componentName === name) {
                    handler(event.params);
                }
            });
        },
    },
});
