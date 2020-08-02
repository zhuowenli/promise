/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-13 09:35:58
 */

declare global {
    namespace NodeJS {
        interface Global {
            __static: string;
            electron: any
        }
    }
}

export {};
