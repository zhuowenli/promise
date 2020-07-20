/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-15 19:39:14
 */

import { Folder } from '@web/__interface';
import store from '@store/index';
import dateFormat from './date-format';

export function filterTime(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() > today.getTime()) {
        return dateFormat(date, 'hh:mm:ss');
    }

    return dateFormat(date, 'yyyy-MM-dd');
}

export function filterTitle(title: (string | undefined)) {
    return title || '未命名的 Snippet';
}

export function filterLabel(label: (string | undefined)) {
    if (label === 'trash') {
        return '已删除';
    }
    let name = '';

    const folders: Folder[] = [...store.state.folders].concat([
        { id: '', name: '未分类' },
        { id: 'all', name: 'All Snippet' },
        { id: 'uncategorized', name: 'Uncategorized' },
        { id: 'trash', name: 'Trash' },
    ]);

    folders.forEach(item => {
        if (item.id === label) {
            name = item.name;
        }
    });

    return name || '未分类';
}
