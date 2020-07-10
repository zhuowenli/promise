/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-10 07:42:51
 */

import findOne from '@web/services/find-one';
import { Action, CREATE_LABEL } from './types';

export const createLabelByName = ({ commit, state }: Action, label: string) => {
    const { result } = findOne(state.labels, { label });
    if (result) return result;

    const id = state.labels.length ? state.labels[state.labels.length - 1].id + 1 : 1;
    const data = { label, id };
    commit(CREATE_LABEL, data);
    return data;
};
