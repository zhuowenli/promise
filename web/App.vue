<template>
    <div class="container">
        <div class="activitybar">
            <FolderMenus
                :folders="systemFolders"
                :drag-post="dragPost"
                @switch="onSwitchActiveFolder"
                @add="onAddFolder"
                @drop="onDroped"
            />

            <FolderMenus
                :folders="folders"
                :drag-post="dragPost"
                title="folders"
                @switch="onSwitchActiveFolder"
                @add="onAddFolder"
                @drop="onDroped"
            />
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
import FolderMenus from '@components/folder-menus/index.vue';
import { filterTitle, filterTime, filterLabel } from '@services/filters';
import { Post, Folder } from '@web/__interface';
import { UPDATE_POST, UPDATE_ACTIVE_FOLDER } from '@store/types';
import { FeatherIcon } from '@zhuowenli/vue-feather-icons';

export default {
    name: 'App',
    components: {
        EditorInstance,
        EditorTitlebar,
        EditorStatusbar,
        FeatherIcon,
        FolderMenus,
    },
    setup() {
        const currentId = ref('');
        const dragable = ref('');
        const dragPost = ref<Post>();
        const store = useStore();
        const systemFolders = ref<Folder[]>([
            { id: 'all', name: 'All Snippet' },
            { id: 'uncategorized', name: 'Uncategorized' },
            { id: 'trash', name: 'Trash' },
        ]);

        // computed
        const postLists = computed<Post[]>(() => store.getters.posts);
        const post = computed(() => postLists.value.find(item => item.id === currentId.value));
        const activeFolder = computed(() => store.state.activeFolder);
        const folders = computed(() => store.state.folders);

        // methods
        async function onCreate() {
            if (activeFolder.value === 'trash') {
                await store.commit(UPDATE_ACTIVE_FOLDER, 'all');
            }
            const from = /all|uncategorized/.test(activeFolder.value) ? '' : activeFolder.value;
            const data: Post = await store.dispatch('createPost', from);
            currentId.value = data.id;
        }
        async function onSwitchActiveFolder(id: string) {
            await store.commit(UPDATE_ACTIVE_FOLDER, id);
        }
        function onSwitchPost(id:string) {
            currentId.value = id;
        }
        async function onAddFolder() {
            await store.dispatch('createFolder');
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
            onAddFolder,
        };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
