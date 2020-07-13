<template>
    <a
        v-if="href"
        class="next-button"
        :href="href"
        :target="target"
        :disabled="disabled || loading"
        :class="[
            type ? 'next-button--' + type : '',
            buttonSize ? 'next-button--' + buttonSize : '',
            { 'is-disabled': disabled, 'is-loading': loading },
        ]"
        @click="onClickAction"
    >
        <NextIcon v-if="loading" name="loading" />
        <slot />
    </a>

    <button
        v-else
        :disabled="disabled || loading"
        :type="nativeType"
        class="next-button"
        :class="[
            type ? 'next-button--' + type : '',
            buttonSize ? 'next-button--' + buttonSize : '',
            { 'is-disabled': disabled, 'is-loading': loading },
        ]"
        @click="onClickAction"
    >
        <NextIcon v-if="loading" name="loading" />
        <slot />
    </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import NextIcon from '../next-icon/index.vue';

export default defineComponent({
    name: 'next-button',
    components: { NextIcon },
    props: {
        href: {
            type: String,
            default: '',
        },
        target: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: 'default',
        },
        size: {
            type: String,
            default: '',
        },
        nativeType: {
            type: String,
            default: 'button',
        },
        loading: Boolean,
        disabled: Boolean,
    },

    setup(props, ctx) {
        const buttonSize = computed(() => props.size);

        return {
            ...props,
            buttonSize,
            onClickAction: (e: any) => ctx.emit('click', e),
        };
    },
});
</script>

<style lang="sass" src="./index.sass"></style>
