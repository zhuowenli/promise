<template>
    <div class="menu">
        <div v-if="title" class="menu__title">
            {{ title }}
            <PlusIcon class="menu__title-add" @click="onAddFolder" />
        </div>
        <div
            v-for="item in folders"
            :key="item.id"
            :ref="el => {if(el) $items[item.id] = el}"
            class="menu__item"
            :data-id="item.id"
            :class="{'is-active': activeFolder === item.id}"
            tabindex="0"
            @dragover.prevent="onDragenter(item.id)"
            @dragleave="onDragleave(item.id)"
            @drop.prevent="onDroped(item.id)"
            @click="onSwitchActiveFolder(item.id)"
            @dblclick="onEditFolder(item)"
            @keydown.delete="onDeleteFolder(item)"
        >
            <ZapIcon v-if="item.id === 'all'" />
            <WatchIcon v-else-if="item.id === 'uncategorized'" />
            <Trash2Icon v-else-if="item.id === 'trash'" />
            <MenuIcon v-else />
            <input
                v-show="item.edit"
                :ref="el => {if(el) $inputs[item.id] = el}"
                v-model="item.name"
                type="text"
                @blur="onUpdateFolder(item)"
                @keydown.enter="onUpdateFolder(item)"
            >
            <div v-show="!item.edit" class="menu__item-inner">{{ item.name }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { ref, computed, defineComponent, nextTick } from 'vue';
import { MenuIcon, PlusIcon, ZapIcon, WatchIcon, Trash2Icon } from '@zhuowenli/vue-feather-icons';
import { Post, Folder } from '@web/__interface';
import { filterTitle } from '@services/filters';
import { UPDATE_FOLDER } from '@store/types';

export default defineComponent({
    name: 'FolderMenus',
    components: {
        MenuIcon,
        PlusIcon,
        ZapIcon,
        WatchIcon,
        Trash2Icon,
    },
    props: {
        folders: {
            type: Array,
            default: () => [],
        },
        title: {
            type: String,
            default: '',
        },
        dragPost: {
            type: Object,
            default: () => ({}),
        },
    },
    emits: ['switch', 'drop', 'add'],
    setup(props, ctx) {
        const store = useStore();

        const menu = ref();
        const dragable = ref('');
        const dragPost = props.dragPost as Post;
        const activeFolder = computed(() => store.state.activeFolder);
        const $inputs = ref<any>({});
        const $items = ref<any>({});

        // drag and drop
        function onDragenter(id: string) {
            if (dragable.value === id) return;
            dragable.value = id;
            $items.value[id].classList.add('is-dragable');
        }
        function onDragleave(id: string) {
            dragable.value = '';
            $items.value[id].classList.remove('is-dragable');
        }
        async function onSwitchActiveFolder(id: string) {
            ctx.emit('switch', id);
            $items.value[id].focus();
        }
        async function onDroped(id: string) {
            let isConfirm = true;
            if (id === 'trash' && dragPost.from !== 'trash') {
                isConfirm = confirm(`确定将 “${filterTitle(dragPost.title)}” 移入回收站？`);
            }

            if ((id === 'all' && dragPost.from !== 'trash') || dragPost.from === id || !isConfirm) {
                ctx.emit('drop', '');
            } else {
                ctx.emit('drop', id);
            }

            onDragleave(id);
        }
        // 编辑文件夹
        async function onEditFolder(item: Folder) {
            if (!props.title) return;
            item.edit = true;
            await nextTick();
            const $input = $inputs.value[item.id];
            $input.focus();
            $input.setSelectionRange(0, 100);
        }
        function onUpdateFolder(item: any) {
            item.edit = false;
            store.commit(UPDATE_FOLDER, [item, { name: item.name, edit: false }]);
        }
        async function onAddFolder() {
            const item = await store.dispatch('createFolder');
            await nextTick();
            const $input = $inputs.value[item.id];
            $input.focus();
            $input.setSelectionRange(0, 100);
        }

        async function onDeleteFolder(item: Folder) {
            console.log(item);
            const isConfirm = confirm(`您确定要删除 “${item.name}” 吗？\n\n被删除文件夹中的所有 Snippet 都将被移动到 “未分类” 中。您无法撤销此操作。`);
            console.log(isConfirm);
        }

        // 您确定要删除 “未命名文件夹” 吗？
        // 被删除文件夹中的所有 Snippet 都将被移动到 “未分类” 中。您无法撤销此操作。

        return {
            menu,
            $inputs,
            $items,
            activeFolder,
            onDragenter,
            onDragleave,
            onSwitchActiveFolder,
            onDroped,
            onAddFolder,
            onUpdateFolder,
            onEditFolder,
            onDeleteFolder,
        };
    },
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
