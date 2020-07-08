<template>
    <div class="container">
        <div id="editor" ref="editor" />
    </div>
</template>

<script lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import 'monaco-editor/esm/vs/editor/edcore.main';

export default {
    name: 'ElectronVue',
    mounted() {
        const { editor } = this.$refs;

        const monacoInstance = monaco.editor.create(editor, {
            value: [
                '## js',
                '\n',
                '```js',
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}',
                '```',
            ].join('\n'),
            language: 'markdown',
            lineDecorationsWidth: 6,
            lineNumbersMinChars: 4,
        });

        monacoInstance.onDidChangeModelContent((event) => {
            const newValue = monacoInstance.getValue();
            console.log(newValue);
        });
        // window.monacoInstance = monacoInstance;
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
