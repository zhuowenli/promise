/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-10 07:43:00
 */

import { State } from 'vue';
import { CREATE_LABEL, Label } from './types';

export default {
    [CREATE_LABEL](state: State, label: Label) {
        state.labels.push(label);
    },
};
