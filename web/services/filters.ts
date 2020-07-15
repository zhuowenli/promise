/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-15 19:39:14
 */

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
    return (label === 'trash' ? '已删除' : label) || '未分类';
}
