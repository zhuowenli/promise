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
            <EditorInstance />
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, watch } from 'vue';
import EditorInstance from './components/editor-instance';
import EditorTitlebar from './components/editor-titlebar';

export default {
    name: 'ElectronVue',
    components: { EditorInstance, EditorTitlebar },
    setup() {
        const post = reactive({
            title: '1212',
        });

        watch(() => post.title, (val) => {
            console.log(val);
        });

        return { post };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
