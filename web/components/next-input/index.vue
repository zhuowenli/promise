<template>
    <div
        :class="[
            type === 'textarea' ? 'next-textarea' : 'next-input',
            inputSize ? 'next-input--' + inputSize : '',
            {
                'next-input--prefix': $slots.prefix,
                'next-input--suffix': $slots.suffix || clearable,
                'is-disabled': disabled,
                'is-focus': focused,
            }
        ]"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
    >
        <template v-if="type !== 'textarea'">
            <span v-if="$slots.prefix" class="next-input__prefix">
                <slot name="prefix" />
            </span>
            <input
                v-if="type !== 'textarea'"
                ref="input"
                v-bind="$attrs"
                class="next-input__inner"
                :type="showPassword ? (passwordVisible ? 'text': 'password') : type"
                :disabled="disabled"
                :readonly="readonly"
                :value="nativeInputValue"
                :autocomplete="autocomplete"
                :placeholder="placeholder"
                @compositionstart="handleCompositionStart"
                @compositionend="handleCompositionEnd"
                @compositionupdate="handleCompositionUpdate"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
                @change="onChange"
                @enter="onEnter"
                @keyup="onKeyup"
                @keyup.enter="onEnter"
            >
            <span
                v-if="$slots.suffix || showClear || showPassword"
                class="next-input__suffix"
            >
                <template v-if="!showClear || !showPwdVisible">
                    <slot name="suffix" />
                </template>
                <i
                    v-if="showClear"
                    class="next-input__icon next-icon-close-circle next-input__clear"
                    @click="clear"
                />
                <i
                    v-if="showPwdVisible"
                    class="next-input__icon next-icon-view next-input__clear"
                    @click="handlePasswordVisible"
                />
            </span>
        </template>

        <textarea
            v-else
            ref="textarea"
            class="next-textarea__inner"
            :value="nativeInputValue"
            v-bind="$attrs"
            :disabled="disabled"
            :readonly="readonly"
            :style="textareaStyle"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
            @change="onChange"
            @enter="onEnter"
            @keyup="onKeyup"
            @keyup.enter="onEnter"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { NextForm, NextFormItem } from '@services/symbol';
import { dispatch, on } from '@services/emitter';
// import calcTextareaHeight from './calcTextareaHeight';

export default defineComponent({
    name: 'NextInput',
    props: {
        value: {
            default: '',
            type: [String, Number],
        },
        size: {
            default: '',
            type: String,
        },
        resize: {
            default: '', // none, both, horizontal, vertical
            type: String,
        },
        form: {
            default: '',
            type: String,
        },
        disabled: Boolean,
        readonly: Boolean,
        type: {
            type: String,
            default: 'text', // text，textarea 和其他 原生 input 的 type 值
        },
        placeholder: {
            type: String,
            default: '',
        },
        autocomplete: {
            type: String,
            default: 'off',
        },
        showPassword: {
            type: Boolean,
            default: false,
        },
        autosize: {
            type: [Boolean, Object],
            default: false,
        },
        label: {
            default: '',
            type: String,
        },
        clearable: {
            type: Boolean,
            default: false,
        },
        max: {
            type: [String, Number],
            default: '',
        },
        pattern: null,
        patternNotArrow: Boolean,
        isByteLength: Boolean,
    },
    setup(props, ctx) {
        const nextForm: any = inject(NextForm);
        const nextFormItem: any = inject(NextFormItem);
        const focused = ref(false);
        const hovering = ref(false);
        const textareaCalcStyle = ref({});
        const passwordVisible = ref(false);
        const input = ref<HTMLInputElement>();
        const textarea = ref<HTMLTextAreaElement>();
        // const isComposing = false;

        // computed
        const textareaStyle = computed(() => Object.assign({}, textareaCalcStyle, { resize: props.resize }));
        const nextFormSize = computed(() => (nextFormItem && nextFormItem.size) || (nextForm && nextForm.size));
        const inputSize = computed(() => props.size || nextFormSize.value);
        const nativeInputValue = computed(() => (props.value === null || props.value === undefined) ? '' : props.value);
        const nativeInputLength = computed(() => getInputLength(`${nativeInputValue.value}`));
        // const maxLength = computed(() => parseInt(`${props.max}`, 10) || 0);
        const showClear = computed(() => props.clearable
            && !props.disabled
            && !props.readonly
            && nativeInputValue.value
            && (focused.value || hovering.value));
        const showPwdVisible = computed(() => props.showPassword
            && !props.disabled
            && !props.readonly
            && (!!nativeInputValue.value || focused.value));

        // methods
        function setNativeInputValue() {
            const $input = getInput();
            if (!$input) return;
            if ($input.value === nativeInputValue.value) return;
            $input.value = `${nativeInputValue.value}`;
        };
        function getInputLength(val: string) {
            return props.isByteLength
                ? val.replace(/[^\u0000-\u1099\u1d00-\u1dbf]/gm, '**').length // eslint-disable-line no-control-regex
                : val.length;
        }
        function getInput() {
            return input.value || textarea.value;
        }
        function select() {
            const $input = getInput();
            if (!$input) return;
            $input.select();
        }
        async function clear() {
            ctx.emit('input', '');
            ctx.emit('change', '');
            ctx.emit('clear');
        }
        async function reset() {
            clear();
            // clearValidate();
        }
        function focus() {
            const $input = getInput();
            if (!$input) return;
            $input.focus();
        }
        function blur() {
            const $input = getInput();
            if (!$input) return;
            $input.blur();
        }
        function onBlur(event: Event) {
            focused.value = false;
            ctx.emit('blur', event);
        }
        function onFocus(event: Event) {
            focused.value = true;
            ctx.emit('focus', event);
        }

        watch(() => nativeInputValue, setNativeInputValue);
        watch(() => props.type, () => {
            nextTick(() => {
                setNativeInputValue();
                // resizeTextarea();
            });
        });
        watch(() => focused, val => dispatch('@NextInputGroup:focus', val));
        watch(() => hovering, val => dispatch('@NextInputGroup:hover', val));

        onMounted(() => {
            on('@NextInput:inputSelect', select);
            setNativeInputValue();
            // resizeTextarea();

            if (nextForm && nextForm.addField) nextForm.addField(ctx);
        });
        onBeforeUnmount(() => {
            if (nextForm && nextForm.removeField) nextForm.removeField(ctx);
        });

        return {
            // ref
            input,
            textarea,

            // data
            focused,
            hovering,
            textareaStyle,
            passwordVisible,
            inputSize,
            nativeInputValue,
            nativeInputLength,
            showClear,
            showPwdVisible,

            // function
            reset,
            clear,
            focus,
            blur,
            onBlur,
            onFocus,
        };
    },
});

</script>
