<template>
    <div class="editor-statusbar">
        <div class="editor-statusbar__item">
            第 {{ position.lineNumber }} 行，{{ position.column }} 列
        </div>
        <div class="editor-statusbar__item">
            空格：4
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';

export default defineComponent({
    name: 'editor-statusbar',
    props: {
        position: {
            type: Object,
            default: () => {},
        },
    },
    setup(props) {
        watch(() => props.position, (val) => {
            console.log(val);
        });
    },
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
