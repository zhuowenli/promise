/*
 * @Author: 卓文理
 * @Email: zhuowenligg@gmail.com
 * @Date: 2019-02-22 14:17:12
 */
/* eslint-disable no-underscore-dangle */

import { createPopper } from '@popperjs/core';
import { isServer } from '@services/dom';
import PopupManager from './popup/popup-manager';

const stop = (e) => e.stopPropagation();

/**
 * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
 * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
 * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end),left(-start, -end)
 * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
 * @param {Boolean} [visible=false] Visibility of the popup element.
 * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
 */
export default {
    props: {
        transformOrigin: {
            type: [Boolean, String],
            default: true,
        },
        placement: {
            type: String,
            default: 'bottom',
        },
        boundariesPadding: {
            type: Number,
            default: 5,
        },
        reference: {},
        popper: {},
        offset: {
            default: 0,
        },
        value: Boolean,
        visibleArrow: Boolean,
        arrowOffset: {
            type: Number,
            default: 35,
        },
        appendToBody: {
            type: Boolean,
            default: true,
        },
        popperOptions: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            showPopper: false,
            currentPlacement: '',
        };
    },

    watch: {
        value: {
            immediate: true,
            handler(val: boolean) {
                this.showPopper = val;
                this.$emit('input', val);
            },
        },

        showPopper(val: boolean) {
            if (this.disabled) return;

            if (val) {
                this.updatePopper();
            } else {
                this.destroyPopper();
            }

            this.$emit('input', val);
        },
    },

    methods: {
        createPopper() {
            if (isServer) return;
            this.currentPlacement = this.currentPlacement || this.placement;
            if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
                return;
            }

            this.referenceElm = this.referenceElm || this.reference || this.$refs.reference;
            this.popperElm = this.popperElm || this.popper || this.$refs.popper;

            if (!this.referenceElm
                && this.$slots.reference
                && this.$slots.reference[0]
            ) {
                this.referenceElm = this.$slots.reference[0].elm;
            }

            if (!this.popperElm || !this.referenceElm) return;
            if (this.visibleArrow) this.appendArrow(this.popperElm);
            if (this.appendToBody) document.body.appendChild(this.popperElm);

            if (this.popperInstance && this.popperInstance.destroy) {
                this.popperInstance.destroy();
            }

            this.popperInstance = createPopper(
                this.referenceElm,
                this.popperElm,
                Object.assign({}, this.popperOptions, {
                    placement: this.currentPlacement,
                    offset: this.offset,
                    arrowOffset: this.arrowOffset,
                    onFirstUpdate: () => {
                        this.$emit('created', this);
                        this.resetTransformOrigin();
                        this.$nextTick(this.updatePopper);
                    },
                }),
            );

            this.popperElm.style.zIndex = PopupManager.nextZIndex();
            this.popperElm.addEventListener('click', stop);
        },

        updatePopper() {
            if (this.popperInstance) {
                this.popperInstance.update(this.referenceElm, this.popperElm);
                if (this.popperElm) {
                    this.popperElm.style.zIndex = PopupManager.nextZIndex();
                }
                this.resetTransformOrigin();
            } else {
                this.createPopper();
            }
        },

        doDestroy(forceDestroy) {
            /* istanbul ignore if */
            if (!this.popperInstance || (this.showPopper && !forceDestroy)) return;
            this.popperInstance.destroy();
            this.popperInstance = null;
        },

        destroyPopper() {
            if (this.popperInstance) {
                this.resetTransformOrigin();
            }
        },

        resetTransformOrigin() {
            if (!this.transformOrigin || !this.popperInstance) return;

            const placementMap = {
                top: 'bottom',
                bottom: 'top',
                left: 'right',
                right: 'left',
            };
            const xplacement = this.popperInstance.state.placement.split('-');
            const placement = xplacement[0];
            const origin = placementMap[placement];
            let space = 'center';

            if (xplacement[1]) {
                space = xplacement[1] === 'start' ? 'top' : 'bottom';
            }

            this.popperElm.style.transformOrigin = typeof this.transformOrigin === 'string'
                ? this.transformOrigin
                : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${origin}` : `${origin} ${space}`;
        },

        appendArrow(element) {
            let hash;
            if (this.appended) {
                return;
            }

            this.appended = true;

            for (const item in element.attributes) {
                if (/^_v-/.test(element.attributes[item].name)) {
                    hash = element.attributes[item].name;
                    break;
                }
            }

            const arrow = document.createElement('div');

            if (hash) {
                arrow.setAttribute(hash, '');
            }

            arrow.setAttribute('x-arrow', '');
            arrow.className = 'hlg-popper__arrow';
            element.appendChild(arrow);
        },
    },

    beforeDestroy() {
        this.doDestroy(true);
        if (this.popperElm && this.popperElm.parentNode === document.body) {
            this.popperElm.removeEventListener('click', stop);
            document.body.removeChild(this.popperElm);
        }
    },

    // call destroy in keep-alive mode
    deactivated() {
        this.$options.beforeDestroy[0].call(this);
    },
};
