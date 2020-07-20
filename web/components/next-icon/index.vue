<template>
    <i :class="'next-icon-' + name" />
</template>

<script>
import { defineComponent, h } from 'vue';

export default defineComponent({
    name: 'NextIcon',
    props: {
        name: String,
    },
    setup(props) {
        return () => h('i', {
            class: 'next-icon-' + props.name,
        });
    },
});
</script>
