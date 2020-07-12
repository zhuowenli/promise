<template>
    <Transition
        name="hlg-zoom-in-top"
        @before-enter="handleMenuEnter"
        @after-leave="doDestroy"
    >
        <div
            v-show="showPopper"
            class="hlg-select-dropdown hlg-popper"
            :class="[{ 'is-multiple': $parent.multiple }, popperClass]"
            :style="{
                width: popperWidth ? popperWidth : '',
                minWidth: !popperWidth ? minWidth : ''
            }"
        >
            <slot />
        </div>
    </Transition>
</template>

<script lang="ts">
import Popper from '@mixins/vue-popper';

export default {
    name: 'HlgSelectDropdown',
    componentName: 'HlgSelectDropdown',
    mixins: [Popper],
    props: {
        placement: {
            type: String,
            default: 'bottom-start',
        },
        boundariesPadding: {
            type: Number,
            default: 0,
        },
        popperOptions: {
            type: Object,
            default() {
                return {};
            },
        },
        visibleArrow: {
            type: Boolean,
            default: true,
        },
        appendToBody: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            minWidth: '',
            popperWidth: '',
            referenceElm: null,
        };
    },

    computed: {
        popperClass() {
            return this.$parent.popperClass;
        },
    },

    watch: {
        '$parent.inputWidth': function (val) {
            this.minWidth = `${val}px`;

            console.log('$parent.inputWidth', val);
        },
        '$parent.popperWidth': {
            immediate: true,
            handler(val) {
                const width = Number.isNaN(parseFloat(val)) ? 0 : parseFloat(val);
                this.popperWidth = width ? `${width}px` : 0;
            },
        },
    },

    mounted() {
        this.referenceElm = this.$parent.$refs.reference.$el || this.$parent.$refs.reference;
        this.popperElm = this.$el;
        this.$parent.popperElm = this.popperElm;

        this.$on('updatePopper', () => {
            if (this.$parent.visible) this.updatePopper();
        });
        this.$on('destroyPopper', () => this.destroyPopper());
        this.$on('visible', val => {
            this.showPopper = val;
        });

        this.$nextTick(() => {
            this.updatePopper();
        });
    },
    methods: {
        doDestroy() {
            if (this.$refs.popper) this.$refs.popper.doDestroy();
        },
        handleMenuEnter() {
            this.$nextTick(() => this.$parent.scrollToOption(this.$parent.selected));
        },
    },
};
</script>
