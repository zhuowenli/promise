<template>
    <div class="container">
        <div class="activitybar">
            1
        </div>
        <div class="sidebar">
            1
        </div>
        <div class="editor-group">
            <div class="titlebar">
                <div class="titlebar__title">
                    <input type="text" class="titlebar__inner" placeholder="未命名 Snippet">
                </div>
                <div class="titlebar__label">
                    <input type="text" class="titlebar__inner" placeholder="添加标签...">
                </div>
                <div class="titlebar__drag-region" />
            </div>

            <EditorInstance />
        </div>
    </div>
</template>

<script lang="ts">
import EditorInstance from './components/editor-instance';

export default {
    name: 'ElectronVue',
    components: { EditorInstance },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
