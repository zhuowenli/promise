<template>
    <div class="editor-titlebar">
        <div class="editor-titlebar__title">
            <input v-model="data.title" type="text" class="editor-titlebar__inner" placeholder="未命名标题">
        </div>
        <div class="editor-titlebar__label">
            <input v-model="data.label" type="text" class="editor-titlebar__inner" placeholder="添加标签...">
        </div>
        <div class="editor-titlebar__drag-region" />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';

export default defineComponent({
    name: 'editor-titlebar',
    props: {
        title: {
            type: String,
            default: '',
        },
        labels: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const data = reactive({
            title: props.title || '',
            label: '',
            labels: props.labels.length ? props.labels : [],
        });

        watch(() => data.title, (val) => {
            emit('update:title', val);
        });

        return {
            data,
        };
    },
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
