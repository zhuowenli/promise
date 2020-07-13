/*
 * @Author: 卓文理
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-02-14 16:52:26
 */

import { Emitter, Handler } from 'mitt';

const emitter: Emitter = mitt();

export default {
    emitter,

    emit<T>(eventName: string, params: T) {
        emitter.emit(eventName, params);
    },

    on(eventName: string, handler: Handler) {
        emitter.on(eventName, handler);
    },
};
