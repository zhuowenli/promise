/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-05-31 11:16:01
 */

declare module '*.vue' {
    import { defineComponent } from 'vue';

    const Component: ReturnType<typeof defineComponent>;
    export default Component;
}
