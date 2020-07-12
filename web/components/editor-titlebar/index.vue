<template>
    <div class="editor-titlebar">
        <div class="editor-titlebar__title">
            <input v-model="data.title" type="text" class="editor-titlebar__inner" placeholder="未命名标题">
        </div>
        <div class="editor-titlebar__label">
            <div class="label">
                <div
                    v-for="(item, id) in labels"
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
import { defineComponent, reactive, watch, ref, PropType } from 'vue';
import { useStore } from 'vuex';
import { Label } from '../../store/types';

export default defineComponent({
    name: 'EditorTitlebar',
    props: {
        title: {
            type: String,
            default: '',
        },
        labels: {
            type: Array as PropType<Label[]>,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const data = reactive({
            title: props.title || '',
            label: '',
        });
        const store = useStore();

        watch(() => data.title, (val) => emit('update:title', val));

        async function onLabelSubmit() {
            if (!data.label) return;
            const labels = ref(props.labels);
            const label = await store.dispatch('createLabelByName', data.label);
            if (!labels.value.some(item => item.id === label.id)) {
                labels.value.push(label);
                emit('update:labels', labels);
            }
            data.label = '';
        }

        function onLabelDelete() {
            if (!data.label && props.labels.length) {
                const labels = ref(props.labels);
                labels.value.pop();
                emit('update:labels', labels);
            }
        }

        return {
            data,
            labels: props.labels,
            onLabelSubmit,
            onLabelDelete,
        };
    },
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
