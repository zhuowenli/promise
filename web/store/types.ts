/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-10 08:11:20
 */

import { ActionContext } from 'vuex';
import { State } from 'vue';

export type Action = ActionContext<State, State>;

export const CREATE_LABEL = '@label/CREATE_LABEL';
