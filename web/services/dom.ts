/*
 * @Author: 绿间
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-01-05 18:08:52
 */

export const isServer = typeof window === 'undefined' || typeof document === 'undefined';

const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

const trim = function (string = '') {
    return string.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};
const camelCase = function (name = '') {
    return name
        .replace(
            SPECIAL_CHARS_REGEXP,
            (_, separator, letter, offset) => (offset ? letter.toUpperCase() : letter),
        )
        .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

export const on = (function () {
    return function on<T>(element: (HTMLElement | Document), event: string, handler: () => any) {
        if (element && event && handler) {
            element.addEventListener(event, handler, false);
        }
    };
}());

export const off = (function () {
    return function off<T>(element: (HTMLElement | Document), event: string, handler: () => T) {
        if (element && event) {
            element.removeEventListener(event, handler, false);
        }
    };
}());

export const once = function (element: (HTMLElement | Document), event: string, handler: () => any) {
    const listener = () => {
        if (handler) {
            // @ts-ignore
            handler.apply(this, [element, event, handler]);
        }
        off(element, event, listener);
    };
    on(element, event, listener);
};

export function matches(el: (HTMLElement | null), selector: string) {
    if (!el || !selector) return null;
    const matchesSelector = el.matches || el.webkitMatchesSelector;
    return matchesSelector.call(el, selector);
}

/**
 * 获取当前每一个匹配元素集的祖先。
 *
 * @export
 * @param {HTMLElement} el 当前元素
 * @param {String} selector 选择器
 * @returns
 */
export function parents(el: (HTMLElement | null), selector: string) {
    if (!el || !selector) return null;

    const result = [];

    // match start from parent
    el = el.parentElement;

    while (el) {
        if (matches(el, selector)) {
            result.push(el);
        }
        el = el.parentElement;
    }

    return result.length ? result : null;
}

export function hasClass(el: (HTMLElement | null), cls: string) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
        return el.classList.contains(cls);
    }
    return (` ${el.className} `).indexOf(` ${cls} `) > -1;
}

export function addClass(el: (HTMLElement | null), cls: string) {
    if (!el) return;
    let curClass = el.className;
    const classes = (cls || '').split(' ');

    for (let i = 0, j = classes.length; i < j; i += 1) {
        const clsName = classes[i];
        if (clsName) {
            if (el.classList) {
                el.classList.add(clsName);
            } else if (!hasClass(el, clsName)) {
                curClass += ` ${clsName}`;
            }
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
}

export function removeClass(el: (HTMLElement | null), cls: string) {
    if (!el || !cls) return;
    const classes = cls.split(' ');
    let curClass = ` ${el.className} `;

    for (let i = 0, j = classes.length; i < j; i += 1) {
        const clsName = classes[i];

        if (clsName) {
            if (el.classList) {
                el.classList.remove(clsName);
            } else if (hasClass(el, clsName)) {
                curClass = curClass.replace(` ${clsName} `, ' ');
            }
        }
    }
    if (!el.classList) {
        el.className = trim(curClass);
    }
}

export const getStyle = function (element: (HTMLElement | null), styleName: any) {
    if (isServer) return;
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }
    try {
        const computed = document?.defaultView?.getComputedStyle(element, '');
        return (element.style[styleName] || computed) ? computed && computed[styleName] : null;
    } catch (e) {
        return element.style[styleName];
    }
};

export function setStyle(element: (HTMLElement | null), styleName: any, value: string) {
    if (!element || !styleName) return;

    if (typeof styleName === 'object') {
        for (const prop in styleName) {
            if (Object.prototype.hasOwnProperty.call(styleName, prop)) {
                setStyle(element, prop, styleName[prop]);
            }
        }
    } else {
        styleName = camelCase(styleName);
        element.style[styleName] = value;
    }
}
