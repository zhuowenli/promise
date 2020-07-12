<template>
    <div class="container">
        <div class="activitybar">
            1
            <br>
            <button @click="onCreate">Create Snippet</button>
        </div>
        <div class="sidebar">
            <div v-for="(item, inx) in postLists" :key="inx" class="post" @click="onSwitchPost(item.id)">
                <div class="title">{{ item.title || '未命名的 Snippet' }}</div>
            </div>
        </div>
        <div v-if="post" class="editor-group">
            <EditorTitlebar
                :post="post"
                @update:title="val => post.title = val"
                @update:labels="val => post.labels = val"
            />
            <EditorInstance
                :post="post"
                @update:position="val => post.position = val"
                @update:model="val => post.model = val"
            />
            <EditorStatusbar :position="post.position" />
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, ref, shallowRef, computed } from 'vue';
import EditorTitlebar from '@components/editor-titlebar/index.vue';
import EditorStatusbar from '@components/editor-statusbar/index.vue';
import EditorInstance, { monaco } from '@components/editor-instance';
import { generateId } from '@services/utils';
import { Post } from '@web/__interface';

export default {
    name: 'App',
    components: { EditorInstance, EditorTitlebar, EditorStatusbar },
    setup() {
        const postLists = reactive<Post[]>([]);
        const currentId = ref('');

        const post = computed(() => {
            return postLists.find(item => item.id === currentId.value);
        });

        function onCreate() {
            const data = shallowRef({
                id: generateId(),
                title: '',
                position: { lineNumber: 1, column: 1 },
                model: monaco.editor.createModel('', 'markdown'),
                createAt: new Date(),
                updateAt: new Date(),
                labels: [],
                language: 'markdown',
            });
            postLists.unshift(data.value);
            currentId.value = data.value.id;
        }

        function onSwitchPost(id:string) {
            currentId.value = id;
        }

        return {
            post,
            postLists,
            currentId,
            onCreate,
            onSwitchPost,
        };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
