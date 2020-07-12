/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-09 11:57:23
 */

import { h, ref, onMounted, defineComponent } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import 'monaco-editor/esm/vs/editor/edcore.main';
import './index.scss';

export default defineComponent({
    name: 'EditorInstance',
    setup(props, { emit }) {
        const root = ref<HTMLElement>();

        onMounted(() => {
            if (!root.value) return;

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

            monacoInstance.onDidChangeCursorPosition(({ position }) => {
                emit('update:position', position);
            });
        });

        return () => h('div', {
            class: 'editor-instance',
            ref: root,
        });
    },
});
