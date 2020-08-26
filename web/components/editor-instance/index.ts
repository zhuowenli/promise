/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-09 11:57:23
 */

import { h, ref, onMounted, defineComponent, toRaw, watch } from 'vue';
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
    emits: ['update:content', 'update:position'],
    setup(props, { emit }) {
        const post = toRaw(props.post as Post);
        const root = ref<HTMLElement>();

        onMounted(() => {
            if (!root.value) return;
            const { language, content, position } = post;

            const monacoInstance = monaco.editor.create(root.value, {
                language: language,
                theme: 'my-theme',
                lineDecorationsWidth: 6,
                lineNumbersMinChars: 4,
                wordWrap: 'on',
                minimap: {
                    enabled: false,
                },
            });

            const model = monaco.editor.createModel(content, language);
            monacoInstance.setModel(model);
            monacoInstance.setPosition(position);
            monacoInstance.onDidChangeModelContent(() => {
                emit('update:content', monacoInstance.getValue());
            });
            monacoInstance.onDidChangeCursorPosition(({ position }) => {
                emit('update:position', position);
            });

            watch(() => props.post.content, () => {
                const post = toRaw(props.post as Post);
                const { language, content, position } = post;
                monaco.editor.setModelLanguage(model, language);
                monacoInstance.setModel(model);
                monacoInstance.setValue(content);
                monacoInstance.setPosition(position);
                monacoInstance.focus();
                console.log(post);
            });

            window.addEventListener('resize', () => {
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
