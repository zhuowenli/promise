/*
 * @Author: 卓文理
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-02-21 14:31:21
 */

import { on, isServer } from '@services/dom';

const nodeList = [];
const ctx = '@@clickoutsideContext';

let startClick;
let seed = 0;

if (!isServer) {
    on(document, 'mousedown', e => {
        startClick = e;
    });
    on(document, 'mouseup', e => {
        nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
    });
}

function createDocumentHandler(el, binding, vnode) {
    return function (mouseup = {}, mousedown = {}) {
        if (!vnode
            || !vnode.context
            || !mouseup.target
            || !mousedown.target
            || el.contains(mouseup.target)
            || el.contains(mousedown.target)
            || el === mouseup.target
            || (vnode.context.popperElm
            && (vnode.context.popperElm.contains(mouseup.target)
            || vnode.context.popperElm.contains(mousedown.target)))
        ) return;

        if (binding.expression
            && el[ctx].methodName
            && vnode.context[el[ctx].methodName]
        ) {
            vnode.context[el[ctx].methodName]();
        } else if (el[ctx].bindingFn) {
            el[ctx].bindingFn();
        }
    };
}

/**
 * v-clickoutside
 * @desc 点击元素外面才会触发的事件
 * @example
 * ```vue
 * <div v-clickoutside="handleClose">
 * ```
 */
export default {
    bind(el, binding, vnode) {
        nodeList.push(el);
        const id = seed;
        seed += 1;
        el[ctx] = {
            id,
            documentHandler: createDocumentHandler(el, binding, vnode),
            methodName: binding.expression,
            bindingFn: binding.value,
        };
    },

    update(el, binding, vnode) {
        el[ctx].documentHandler = createDocumentHandler(el, binding, vnode);
        el[ctx].methodName = binding.expression;
        el[ctx].bindingFn = binding.value;
    },

    unbind(el) {
        const len = nodeList.length;

        for (let i = 0; i < len; i += 1) {
            if (nodeList[i][ctx].id === el[ctx].id) {
                nodeList.splice(i, 1);
                break;
            }
        }
        delete el[ctx];
    },
};
