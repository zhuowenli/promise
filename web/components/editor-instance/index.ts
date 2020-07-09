/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-09 11:57:23
 */

import { h, ref, onMounted, defineComponent } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import 'monaco-editor/esm/vs/editor/edcore.main';

export default defineComponent({
    name: 'EditorInstance',
    setup() {
        const root = ref(document.createElement('div'));

        onMounted(() => {
            const monacoInstance = monaco.editor.create(root.value, {
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
                theme: 'vs',
                lineDecorationsWidth: 6,
                lineNumbersMinChars: 4,
            });

            monacoInstance.onDidChangeModelContent((event) => {
                const newValue = monacoInstance.getValue();
                console.log(newValue);
            });
        });

        return () => h('div', {
            class: 'editor-instance',
            ref: root,
        });
    },
});
