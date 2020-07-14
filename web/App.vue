<template>
    <div class="container">
        <div class="activitybar">
            <div class="menu">
                <div class="menu__item">All Snippets</div>
                <div class="menu__item">Uncategorized</div>
                <div class="menu__item">Trash</div>
            </div>
        </div>
        <div class="sidebar">
            <div class="search-box">
                <div class="search-box__inner">1</div>
                <div class="search-box__button" @click="onCreate">
                    <FeatherIcon />
                </div>
            </div>
            <div
                v-for="(item, inx) in postLists"
                :key="inx"
                class="post"
                :class="{'is-active': item.id === currentId}"
                @click="onSwitchPost(item.id)"
            >
                <div class="meta">
                    <div class="from">{{ item.from || '未分类' }}</div>
                    <div class="time">{{ formatTime(item.updateAt) }}</div>
                </div>
                <div class="title">{{ item.title || '未命名的 Snippet' }}</div>
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
import dateFormat from '@services/date-format';
import { FeatherIcon } from '@zhuowenli/vue-feather-icons';
import { Post } from '@web/__interface';

export default {
    name: 'App',
    components: { EditorInstance, EditorTitlebar, EditorStatusbar, FeatherIcon },
    setup() {
        const currentId = ref('');
        const store = useStore();
        const postLists = computed<Post[]>(() => store.state.posts);
        const post = computed(() => postLists.value.find(item => item.id === currentId.value));

        async function onCreate() {
            const data: Post = await store.dispatch('createPost');
            currentId.value = data.id;
        }

        function onSwitchPost(id:string) {
            currentId.value = id;
        }

        function formatTime(date: Date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date.getTime() > today.getTime()) {
                return dateFormat(date, 'hh:mm:ss');
            }

            return dateFormat(date, 'yyyy-MM-dd');
        }

        return {
            post,
            postLists,
            currentId,
            onCreate,
            onSwitchPost,
            formatTime,
        };
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
