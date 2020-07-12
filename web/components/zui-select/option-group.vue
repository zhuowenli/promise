<template>
    <ul v-show="visible" class="hlg-select-group__wrap">
        <li class="hlg-select-group__title">
            {{ label }}
        </li>
        <li>
            <ul class="hlg-select-group">
                <slot />
            </ul>
        </li>
    </ul>
</template>

<script>
import Emitter from '@mixins/emitter';

export default {
    name: 'HlgOptionGroup',
    componentName: 'HlgOptionGroup',
    mixins: [Emitter],
    props: {
        label: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            visible: true,
        };
    },

    watch: {
        disabled(val) {
            this.broadcast('HlgOption', 'handleGroupDisabled', val);
        },
    },

    created() {
        this.$on('queryChange', this.queryChange);
    },

    mounted() {
        if (this.disabled) {
            this.broadcast('HlgOption', 'handleGroupDisabled', this.disabled);
        }
    },

    methods: {
        queryChange() {
            this.visible = this.$children
                && Array.isArray(this.$children)
                && this.$children.some(option => option.visible === true);
        },
    },
};
</script>
