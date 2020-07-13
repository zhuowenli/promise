<template>
    <div class="editor-titlebar">
        <div class="editor-titlebar__title">
            <input v-model="data.title" type="text" class="editor-titlebar__inner" placeholder="未命名标题">
        </div>
        <div class="editor-titlebar__label">
            <div class="label">
                <div
                    v-for="(item, id) in labelLists"
                    :key="id"
                    class="label__item"
                >
                    {{ item.label }}
                </div>
            </div>
            <input
                v-model="data.label"
                type="text"
                class="editor-titlebar__inner"
                placeholder="添加标签..."
                @keyup.enter="onLabelSubmit"
                @blur="onLabelSubmit"
                @keydown.delete="onLabelDelete"
            >
        </div>
        <div class="editor-titlebar__drag-region" />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, ref, toRaw } from 'vue';
import { useStore } from 'vuex';
import { Post } from '@web/__interface';

export default defineComponent({
    name: 'EditorTitlebar',
    props: {
        post: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const post = toRaw(props.post as Post);
        const data = reactive({
            title: post.title || '',
            label: '',
        });
        const store = useStore();

        watch(() => data.title, (val) => {
            emit('update:title', val);
        });

        watch(() => props.post.title, () => {
            const post = toRaw(props.post as Post);
            const { title } = post;
            data.title = title;
        });

        async function onLabelSubmit() {
            if (!data.label) return;
            const labels = ref(post.labels);
            const label = await store.dispatch('createLabelByName', data.label);
            if (!labels.value.some(item => item.id === label.id)) {
                labels.value.push(label);
                emit('update:labels', labels);
            }
            data.label = '';
        }

        async function onLabelDelete() {
            if (!data.label && post.labels.length) {
                const labels = ref(post.labels);
                labels.value.pop();
                emit('update:labels', labels);
            }
        }

        return {
            data,
            onLabelSubmit,
            onLabelDelete,
            labelLists: post.labels,
        };
    },
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
