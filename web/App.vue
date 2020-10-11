<template>
    <div class="container">
        <div class="activitybar">
            <FolderMenus
                :folders="systemFolders"
                :drag-post="dragPost"
                @switch="onSwitchActiveFolder"
                @drop="onDroped"
            />

            <FolderMenus
                :folders="folders"
                :drag-post="dragPost"
                title="folders"
                @switch="onSwitchActiveFolder"
                @drop="onDroped"
            />
        </div>

        <div class="sidebar">
            <div class="search-box">
                <div class="search-box__inner">1</div>
                <div class="search-box__button" @click="onCreate">
                    <FeatherIcon size="16" />
                </div>
            </div>
            <div
                v-for="(item, inx) in postLists"
                :key="inx"
                class="post"
                :class="{'is-active': item.id === currentId}"
                draggable="true"
                @click="onSwitchPost(item.id)"
                @dragstart="onDragstart(item)"
            >
                <div class="meta">
                    <div class="from">{{ filterLabel(item.from) }}</div>
                    <div class="time">{{ filterTime(item.updateAt) }}</div>
                </div>
                <div class="title">{{ filterTitle(item.title) }}</div>
            </div>
        </div>

        <div v-if="post" class="editor-group">
            <EditorTitlebar
                :post="post"
                @update:title="val => onUpdatePost('title', val)"
                @update:labels="val => onUpdatePost('labels', val)"
            />
            <div class="editor-group__inner">
                <EditorInstance
                    :post="post"
                    @update:position="val => post.position = val"
                    @update:content="val => onUpdatePost('content', val)"
                />
                <div v-if="setting.markdown.enable" class="editor-group__markdown" v-html="$markdown" />
            </div>
            <EditorStatusbar :position="post.position" />
        </div>
    </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import EditorTitlebar from '@components/editor-titlebar/index.vue';
import EditorStatusbar from '@components/editor-statusbar/index.vue';
import EditorInstance from '@components/editor-instance';
import FolderMenus from '@components/folder-menus/index.vue';
import { filterTitle, filterTime, filterLabel } from '@services/filters';
import { Post, Folder } from '@web/__interface';
import { UPDATE_POST, UPDATE_ACTIVE_FOLDER } from '@store/types';
import { FeatherIcon } from '@zhuowenli/vue-feather-icons';
import markdownIt = require('markdown-it');
import hljs = require('highlight.js');
import _ = require('lodash');
import * as $ from 'jquery';

export default {
    name: 'App',
    components: {
        EditorInstance,
        EditorTitlebar,
        EditorStatusbar,
        FeatherIcon,
        FolderMenus,
    },
    setup(ctx) {
        const currentId = ref('');
        const dragable = ref('');
        const dragPost = ref<Post>();
        const store = useStore();
        const $markdown = ref('');
        const systemFolders = ref<Folder[]>([
            { id: 'all', name: 'All Snippet' },
            { id: 'uncategorized', name: 'Uncategorized' },
            { id: 'trash', name: 'Trash' },
        ]);

        // computed
        const postLists = computed<Post[]>(() => store.getters.posts
            .sort((a:any, b:any) => (+new Date(b.updateAt) - +new Date(a.updateAt))));
        const post = computed(() => postLists.value.find(item => item.id === currentId.value));
        const activeFolder = computed(() => store.state.activeFolder);
        const folders = computed(() => store.state.folders);
        const setting = computed(() => store.state.setting);
        const md = markdownIt({
            html: true, // Enable HTML tags in source
            xhtmlOut: false, // Use '/' to close single tags (<br />)
            breaks: true, // Convert '\n' in paragraphs into <br>
            langPrefix: 'language-', // CSS language prefix for fenced blocks
            linkify: true, // autoconvert URL-like texts to links
            typographer: true, // Enable smartypants and other sweet transforms

            // options below are for demo only
            _highlight: true,
            _strict: false,
            _view: 'html', // html / src / debug
            highlight: function (str: string, lang: string) {
                const esc = md.utils.escapeHtml;
                if (lang && lang !== 'auto' && hljs.getLanguage(lang)) {
                    return '<pre class="hljs language-' + esc(lang.toLowerCase()) + '"><code>' +
                        hljs.highlight(lang, str, true).value +
                        '</code></pre>';
                } else if (lang === 'auto') {
                    const result = hljs.highlightAuto(str);
                    console.log('highlight language: ' + result.language + ', relevance: ' + result.relevance);
                    return '<pre class="hljs language-' + esc(result.language) + '"><code>' +
                        result.value +
                        '</code></pre>';
                }
                return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
            },
        });
        let scrollMap: any;

        console.log(_);

        // Build offsets for each line (lines can be wrapped)
        // That's a bit dirty to process each line everytime, but ok for demo.
        // Optimizations are required only for big texts.
        function buildScrollMap() {
            let i;
            let pos, a, b;
            const textarea = $('.source');
            const sourceLikeDiv = $('<div />').css({
                position: 'absolute',
                visibility: 'hidden',
                height: 'auto',
                width: textarea[0].clientWidth,
                'font-size': textarea.css('font-size'),
                'font-family': textarea.css('font-family'),
                'line-height': textarea.css('line-height'),
                'white-space': textarea.css('white-space'),
            }).appendTo('body');
            const offset = $('.editor-group__markdown').scrollTop() - $('.editor-group__markdown').offset().top;
            const _scrollMap = [];
            const nonEmptyList = [];
            const lineHeightMap: any[] = [];

            let acc = 0;
            textarea.val().split('\n').forEach(function (str: string) {
                lineHeightMap.push(acc);

                if (str.length === 0) {
                    acc++;
                    return;
                }

                sourceLikeDiv.text(str);
                const h = parseFloat(sourceLikeDiv.css('height'));
                const lh = parseFloat(sourceLikeDiv.css('line-height'));
                acc += Math.round(h / lh);
            });
            sourceLikeDiv.remove();
            lineHeightMap.push(acc);
            const linesCount = acc;

            for (i = 0; i < linesCount; i++) { _scrollMap.push(-1); }

            nonEmptyList.push(0);
            _scrollMap[0] = 0;

            $('.line').each(function (n: number, el: HTMLElement) {
                const $el = $(el);
                let t = $el.data('line');
                if (t === '') { return; }
                t = lineHeightMap[t];
                if (t !== 0) { nonEmptyList.push(t); }
                _scrollMap[t] = Math.round($el.offset().top + offset);
            });

            nonEmptyList.push(linesCount);
            _scrollMap[linesCount] = $('.editor-group__markdown')[0].scrollHeight;

            pos = 0;
            for (i = 1; i < linesCount; i++) {
                if (_scrollMap[i] !== -1) {
                    pos++;
                    continue;
                }

                a = nonEmptyList[pos];
                b = nonEmptyList[pos + 1];
                _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
            }

            return _scrollMap;
        }
        // Synchronize scroll position from source to result
        const syncResultScroll = _.debounce(function () {
            const textarea = $('.source');
            const lineHeight = parseFloat(textarea.css('line-height'));

            const lineNo = Math.floor(textarea.scrollTop() / lineHeight);
            if (!scrollMap) { scrollMap = buildScrollMap(); }
            const posTo = scrollMap[lineNo];
            $('.editor-group__markdown').stop(true).animate({
                scrollTop: posTo,
            }, 100, 'linear');
        }, 50, { maxWait: 50 });

        // Synchronize scroll position from result to source
        const syncSrcScroll = _.debounce(function () {
            const resultHtml = $('.editor-group__markdown');
            const scrollTop = resultHtml.scrollTop();
            const textarea = $('.source');
            const lineHeight = parseFloat(textarea.css('line-height'));
            let i;
            let line;

            if (!scrollMap) { scrollMap = buildScrollMap(); }

            const lines = Object.keys(scrollMap);

            if (lines.length < 1) {
                return;
            }

            line = lines[0];

            for (i = 1; i < lines.length; i++) {
                if (scrollMap[lines[i]] < scrollTop) {
                    line = lines[i];
                    continue;
                }

                break;
            }

            textarea.stop(true).animate({
                scrollTop: lineHeight * (+line),
            }, 100, 'linear');
        }, 50, { maxWait: 50 });


        // methods
        async function onCreate() {
            if (activeFolder.value === 'trash') {
                await store.commit(UPDATE_ACTIVE_FOLDER, 'all');
            }
            const from = /all|uncategorized/.test(activeFolder.value) ? '' : activeFolder.value;
            const data: Post = await store.dispatch('createPost', from);
            currentId.value = data.id;

            $('.source').on('touchstart mouseover', function () {
                $('.editor-group__markdown').off('scroll');
                $('.source').on('scroll', syncResultScroll);
            });
            $('.editor-group__markdown').on('touchstart mouseover', function () {
                $('.source').off('scroll');
                $('.editor-group__markdown').on('scroll', syncSrcScroll);
            });
        }
        async function onSwitchActiveFolder(id: string) {
            await store.commit(UPDATE_ACTIVE_FOLDER, id);
        }
        async function onSwitchPost(id:string) {
            currentId.value = id;
            // await ctx
            const result = md.render(post.value?.content);
            $markdown.value = result;
        }

        function onUpdatePost(key: 'content'|'title'|'labels', val: any) {
            if (JSON.stringify(post.value?.[key]) === JSON.stringify(val)) return;

            const result = md.render(post.value?.content);
            $markdown.value = result;

            store.commit(UPDATE_POST, [post.value, {
                [key]: val,
                updateAt: new Date(),
            }]);
        }

        // drag and drop
        async function onDroped(id: string) {
            if (!id || !dragPost.value) {
                dragPost.value = undefined;
                return;
            }

            if (id === 'uncategorized') {
                await store.commit(UPDATE_POST, [dragPost.value, { from: '' }]);
            } else {
                await store.commit(UPDATE_POST, [dragPost.value, { from: id === 'all' ? '' : id }]);
            }

            dragPost.value = undefined;
        }
        function onDragstart(item: Post) {
            if (dragPost.value && dragPost.value.id === item.id) return;
            dragPost.value = item;
        }

        return {
            post,
            postLists,
            systemFolders,
            currentId,
            dragable,
            activeFolder,
            folders,
            setting,

            // filter
            filterTime,
            filterTitle,
            filterLabel,

            // methods
            onCreate,
            onSwitchPost,
            onDroped,
            onDragstart,
            onSwitchActiveFolder,
            onUpdatePost,

            $markdown,
        };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
