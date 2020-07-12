/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-09 11:57:23
 */

import { h, ref, onMounted, defineComponent, toRaw } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import 'monaco-editor/esm/vs/editor/edcore.main';
import { Post } from '@web/__interface';
import './index.scss';

monaco.editor.defineTheme('my-theme', {
    base: 'vs',
    inherit: true,
    rules: [{
        token: '',
        background: '#ffffff',
    }],
    colors: {
        'editor.background': '#ffffff',
    },
});

export default defineComponent({
    name: 'EditorInstance',
    props: {
        post: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const post = toRaw(props.post as Post);
        const root = ref<HTMLElement>();

        onMounted(() => {
            if (!root.value) return;
            const { language, model, position } = post;

            const monacoInstance = monaco.editor.create(root.value, {
                language: language,
                theme: 'my-theme',
                lineDecorationsWidth: 6,
                lineNumbersMinChars: 4,
                minimap: {
                    enabled: false,
                },
            });

            monacoInstance.setModel(model);
            monacoInstance.setPosition(position);

            monacoInstance.onDidChangeModelContent((event) => {
                emit('update:model', monacoInstance.getModel());
            });

            monacoInstance.onDidChangeCursorPosition(({ position }) => {
                emit('update:position', position);
            });

            window.addEventListener('resize', () => {
                console.log('resize');
                monacoInstance.layout();
            });
        });

        return () => h('div', {
            class: 'editor-instance',
            ref: root,
        });
    },
});
export { monaco };
