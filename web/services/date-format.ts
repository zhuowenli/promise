/*
 * @Author: 卓文理
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-10-10 10:52:26
 */

/**
 * 日期时间格式化
 * @param  {Date}   time   时间
 * @param  {String} format 格式化内容 'yyyy-MM-dd hh:mm:ss'
 * @return {String}        格式化后的时间 '2016-05-04 12:12:00'
 */
export default function dateFormat(time: any, format = 'yyyy-MM-dd hh:mm:ss') {
    if (!time) return 'null';

    let value = time;

    if (typeof value === 'number') {
        if (String(time).length < 10) {
            value = new Date().getTime();
        } else if (String(time).length === 10) {
            value = time * 1000;
        }
    }

    const date = new Date(value);

    const map = {
        M: date.getMonth() + 1, // 月份
        d: date.getDate(), // 日
        h: date.getHours(), // 小时
        m: date.getMinutes(), // 分
        s: date.getSeconds(), // 秒
        q: Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds(), // 毫秒
    } as any;

    return format.replace(/(y+|M+|d+|h+|m+|s+|q+|S+)/g, (all, t) => {
        t = t.length > 1 ? t[0] : t;
        let v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = `0${v}`;
                v = v.substr(v.length - 2);
            }
            return v;
        } if (t === 'y') {
            return (String(date.getFullYear())).substr(4 - all.length);
        }
        return all;
    });
};
