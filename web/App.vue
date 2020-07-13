<template>
    <div class="container">
        <div class="activitybar">
            1
            <br>
            <button @click="onCreate">Create Snippet</button>
        </div>
        <div class="sidebar">
            <div
                v-for="(item, inx) in postLists"
                :key="inx"
                class="post"
                :class="{'is-active': item.id === currentId}"
                @click="onSwitchPost(item.id)"
            >
                <div class="title">{{ item.title || '未命名的 Snippet' }}</div>
                <div class="meta">
                    {{ formatTime(item.updateAt) }}
                </div>
            </div>
        </div>
        <div v-if="post" class="editor-group">
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
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, ref, computed } from 'vue';
import { useStore } from 'vuex';
import EditorTitlebar from '@components/editor-titlebar/index.vue';
import EditorStatusbar from '@components/editor-statusbar/index.vue';
import EditorInstance from '@components/editor-instance';
import dateFormat from '@services/date-format';
import { Post } from '@web/__interface';

export default {
    name: 'App',
    components: { EditorInstance, EditorTitlebar, EditorStatusbar },
    setup() {
        const postLists = reactive<Post[]>([]);
        const currentId = ref('');
        const store = useStore();

        const post = computed(() => {
            return postLists.find(item => item.id === currentId.value);
        });

        async function onCreate() {
            const data: Post = await store.dispatch('createPost');
            postLists.unshift(data);
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
