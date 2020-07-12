/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 11:46:05
 */

declare global {
    namespace NodeJS {
        interface Global {
            __static: string;
        }
    }
}

export {};
