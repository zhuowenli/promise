/*
 * @Author: 卓文理
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-03-09 16:32:38
 */

import { once, on, mousedown, mouseup } from '@services/dom';

export default {
    bind(el, binding, vnode) {
        let interval = null;
        let startTime;
        const handler = () => vnode.context[binding.expression].apply();
        const clear = () => {
            if (new Date() - startTime < 100) {
                handler();
            }
            clearInterval(interval);
            interval = null;
        };

        on(el, mousedown, (e) => {
            if (e.button !== 0) return;
            startTime = new Date();
            once(document, mouseup, clear);
            clearInterval(interval);
            interval = setInterval(handler, 100);
        });
    },
};
