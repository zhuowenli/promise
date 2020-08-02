<template>
    <div class="menu">
        <div v-if="title" class="menu__title">
            {{ title }}
            <PlusIcon class="menu__title-add" @click="onAddFolder" />
        </div>
        <div
            v-for="item in folders"
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
            <WatchIcon v-else-if="item.id === 'uncategorized'" />
            <Trash2Icon v-else-if="item.id === 'trash'" />
            <MenuIcon v-else />
            {{ item.name }}
        </div>
    </div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { ref, computed, defineComponent } from 'vue';
import { MenuIcon, PlusIcon, ZapIcon, WatchIcon, Trash2Icon } from '@zhuowenli/vue-feather-icons';
import { Post } from '@web/__interface';
import { filterTitle } from '@services/filters';

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

        const dragable = ref('');
        const dragPost = props.dragPost as Post;
        const activeFolder = computed(() => store.state.activeFolder);

        // drag and drop
        function onDragover(id: string) {
            if (dragable.value === id) return;
            dragable.value = id;
        }

        async function onSwitchActiveFolder(id: string) {
            ctx.emit('switch', id);
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

            dragable.value = '';
        }

        function onAddFolder() {
            ctx.emit('add');
        }

        return {
            activeFolder,
            onDragover,
            onSwitchActiveFolder,
            onDroped,
            onAddFolder,
        };
    },
});
</script>
