<template>
    <div class="container">
        <div class="activitybar">
            <div class="menu">
                <div
                    v-for="item in systemFolders"
                    :key="item.id"
                    class="menu__item"
                    :class="{
                        'is-dragable': dragable === item.id,
                        'is-active': activeFolder === item.id
                    }"
                    @dragover.prevent="onDragover(item.id)"
                    @dragleave="dragable = ''"
                    @drop.prevent="onDroped(item.id)"
                    @click="onSwitchActiveFolder(item.id)"
                >
                    <ZapIcon v-if="item.id === 'all'" />
                    <WatchIcon v-if="item.id === 'uncategorized'" />
                    <Trash2Icon v-if="item.id === 'trash'" />
                    {{ item.name }}
                </div>
            </div>
        </div>

        <div class="sidebar">
            <div class="search-box">
                <div class="search-box__inner">1</div>
                <div class="search-box__button" @click="onCreate">
                    <FeatherIcon size="14" />
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

        <div class="editor-group">
            <template v-if="post">
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
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import EditorTitlebar from '@components/editor-titlebar/index.vue';
import EditorStatusbar from '@components/editor-statusbar/index.vue';
import EditorInstance from '@components/editor-instance';
import { filterTitle, filterTime, filterLabel } from '@services/filters';
import { FeatherIcon, ZapIcon, WatchIcon, Trash2Icon } from '@zhuowenli/vue-feather-icons';
import { Post, Folder } from '@web/__interface';
import { UPDATE_POST, UPDATE_ACTIVE_FOLDER } from '@store/types';


export default {
    name: 'App',
    components: {
        EditorInstance,
        EditorTitlebar,
        EditorStatusbar,
        FeatherIcon,
        ZapIcon,
        WatchIcon,
        Trash2Icon,
    },
    setup() {
        const currentId = ref('');
        const dragable = ref('');
        const dragPost = ref<Post>();
        const store = useStore();

        // computed
        const postLists = computed<Post[]>(() => store.getters.posts);
        const post = computed(() => postLists.value.find(item => item.id === currentId.value));
        const activeFolder = computed(() => store.state.activeFolder);
        const systemFolders = ref<Folder[]>([
            { id: 'all', name: 'All Snippet' },
            { id: 'uncategorized', name: 'Uncategorized' },
            { id: 'trash', name: 'Trash' },
        ]);

        // methods
        async function onCreate() {
            const data: Post = await store.dispatch('createPost');
            currentId.value = data.id;
        }
        async function onSwitchActiveFolder(id: string) {
            await store.commit(UPDATE_ACTIVE_FOLDER, id);
        }
        function onSwitchPost(id:string) {
            currentId.value = id;
        }

        // drag and drop
        function onDragover(id: string) {
            if (dragable.value === id) return;
            dragable.value = id;
        }
        async function onDroped(id: string) {
            let isConfirm = true;
            if (id === 'trash' && dragPost.value?.from !== 'trash') {
                isConfirm = confirm(`确定将 “${filterTitle(dragPost.value?.title)}” 移入回收站？`);
            }
            if (
                (id === 'all' && dragPost.value?.from !== 'trash')
                || dragPost.value?.from === id
                || !isConfirm
            ) {
                dragPost.value = undefined;
                dragable.value = '';
                return;
            }

            if (id === 'uncategorized') {
                await store.commit(UPDATE_POST, [dragPost.value, { from: '' }]);
            } else {
                await store.commit(UPDATE_POST, [dragPost.value, { from: id === 'all' ? '' : id }]);
            }

            dragPost.value = undefined;
            dragable.value = '';
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

            // filter
            filterTime,
            filterTitle,
            filterLabel,

            // methods
            onCreate,
            onSwitchPost,
            onDragover,
            onDroped,
            onDragstart,
            onSwitchActiveFolder,
        };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
