<template>
    <div class="container">
        <div class="activitybar">
            1
        </div>
        <div class="sidebar">
            1
        </div>
        <div class="editor-group">
            <EditorTitlebar :title="post.title" @update:title="val => post.title = val" />
            <EditorInstance :position="post.position" @update:position="val => post.position = val" />
            <EditorStatusbar :position="post.position" />
        </div>
    </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import EditorTitlebar from '@components/editor-titlebar/index.vue';
import EditorStatusbar from '@components/editor-statusbar/index.vue';
import EditorInstance from '@components/editor-instance';

export default {
    name: 'App',
    components: { EditorInstance, EditorTitlebar, EditorStatusbar },
    setup() {
        const post = reactive({
            title: '',
            position: { lineNumber: 1, column: 1 },
        });

        return { post };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
