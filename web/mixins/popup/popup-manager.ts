/*
 * @Author: 绿间
 * @Email: zhuowenligg@gmail.com
 * @Date: 2018-12-28 15:36:41
 */

import { addClass, removeClass, isServer } from '@services/dom';

let hasModal = false;
let hasInitZIndex = false;
let zIndex = 2000;

const getModal = function () {
    let modalDom = PopupManager.modalDom;
    if (modalDom) {
        hasModal = true;
    } else {
        hasModal = false;
        modalDom = document.createElement('div');
        PopupManager.modalDom = modalDom;

        modalDom.addEventListener('touchmove', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        modalDom.addEventListener('click', () => {
            if (PopupManager.doOnModalClick) PopupManager.doOnModalClick();
        });
    }

    return modalDom;
};

const instances: any = {};

interface ModalStack {
    id: string
    zIndex: number
    modalClass: string
    lockScroll: boolean
}

const PopupManager = {
    zIndex,
    modalFade: true,
    modalStack: [] as ModalStack[],
    modalDom: null as null | HTMLDivElement,

    getInstance(id: string) {
        return instances[id];
    },

    register(id: string, instance: any) {
        if (id && instance) {
            instances[id] = instance;
        }
    },

    deregister(id: string) {
        if (id) {
            instances[id] = null;
            delete instances[id];
        }
    },

    nextZIndex(): number {
        PopupManager.zIndex += 1;
        return PopupManager.zIndex;
    },

    doOnModalClick() {
        const topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];
        if (!topItem) return;

        const instance = PopupManager.getInstance(topItem.id);
        if (instance && instance.closeOnClickModal) {
            instance.close();
        }
    },

    openModal(
        id: string, $zIndex: number, dom: HTMLElement,
        modalClass: string, modalFade: boolean, lockScroll: boolean,
    ) {
        if (!id || $zIndex === undefined) return;
        this.modalFade = modalFade;

        const modalStack = this.modalStack;

        for (let i = 0, j = modalStack.length; i < j; i += 1) {
            const item = modalStack[i];
            if (item.id === id) {
                return;
            }
        }

        const modalDom = getModal();

        addClass(modalDom, 'hlg-mask');
        if (this.modalFade && !hasModal) {
            addClass(modalDom, 'hlg-mask-enter');
        }
        if (modalClass) {
            const classArr = modalClass.trim().split(/\s+/);
            classArr.forEach(item => addClass(modalDom, item));
        }

        setTimeout(() => {
            removeClass(modalDom, 'hlg-mask-enter');
        }, 200);

        if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
            dom.parentNode.appendChild(modalDom);
        } else {
            document.body.appendChild(modalDom);
        }

        if (zIndex) {
            modalDom.style.zIndex = `${zIndex}`;
        }
        modalDom.tabIndex = 0;
        modalDom.style.display = '';

        this.modalStack.push({ id, zIndex, modalClass, lockScroll });
    },

    closeModal(id: string) {
        const modalStack = this.modalStack;
        const modalDom = getModal();

        if (modalStack.length > 0) {
            const topItem = modalStack[modalStack.length - 1];
            if (topItem.id === id) {
                if (topItem.modalClass) {
                    const classArr = topItem.modalClass.trim().split(/\s+/);
                    classArr.forEach(item => removeClass(modalDom, item));
                }

                modalStack.pop();
                if (modalStack.length > 0) {
                    modalDom.style.zIndex = `${modalStack[modalStack.length - 1].zIndex}`;
                }
            } else {
                for (let i = modalStack.length - 1; i >= 0; i -= 1) {
                    if (modalStack[i].id === id) {
                        modalStack.splice(i, 1);
                        break;
                    }
                }
            }
        }

        if (modalStack.length === 0) {
            if (this.modalFade) {
                addClass(modalDom, 'hlg-mask-leave');
            }
            setTimeout(() => {
                if (modalStack.length === 0) {
                    if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom);
                    modalDom.style.display = 'none';
                    PopupManager.modalDom = null;
                }
                removeClass(modalDom, 'hlg-mask-leave');
            }, 200);
        }
    },
};

Object.defineProperty(PopupManager, 'zIndex', {
    configurable: true,
    get() {
        if (!hasInitZIndex) {
            hasInitZIndex = true;
        }
        return zIndex;
    },
    set(value) {
        zIndex = value;
    },
});

const getTopPopup = function () {
    if (isServer) return;
    if (PopupManager.modalStack.length > 0) {
        const topPopup = PopupManager.modalStack[PopupManager.modalStack.length - 1];
        if (!topPopup) return;
        const instance = PopupManager.getInstance(topPopup.id);

        return instance;
    }
};

if (!isServer) {
    window.addEventListener('keydown', (event) => {
        const topPopup = getTopPopup();

        if (!topPopup) return;

        if (event.keyCode === 27) {
            if (topPopup.closeOnPressEscape) {
                if (topPopup.handleClose) {
                    topPopup.handleClose();
                } else if (topPopup.handleAction) {
                    topPopup.handleAction('cancel');
                } else {
                    topPopup.close();
                }
            }
        } else if (event.keyCode === 13) {
            if (topPopup.handleAction) {
                topPopup.handleAction('confirm');
            }
        }
    });
}

export default PopupManager;
