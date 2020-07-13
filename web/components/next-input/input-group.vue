<template>
    <div
        class="next-input-group"
        :class="{
            'is-hover': hovering,
            'is-focus': focused,
        }"
    >
        <div v-if="$slots.prepend" class="next-input-group__prepend">
            <slot name="prepend" />
        </div>
        <slot />
        <div v-if="$slots.append" class="next-input-group__append">
            <slot name="append" />
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { on } from '@services/emitter';

export default defineComponent({
    name: 'NextInputGroup',
    setup() {
        const hovering = ref(false);
        const focused = ref(false);

        onMounted(() => {
            on('NextInputGroup:focus', val => {
                focused.value = val;
            });
            on('NextInputGroup:hover', val => {
                hovering.value = val;
            });
        });

        return {
            hovering,
            focused,
        };
    },
});
</script>
