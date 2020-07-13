<template>
    <div
        :class="[
            type === 'textarea' ? 'next-textarea' : 'next-input',
            inputSize ? 'next-input--' + inputSize : '',
            {
                'next-input-group': $slots.prepend || $slots.append || $scopedSlots.append,
                'next-input-group--append': $slots.append || $scopedSlots.append,
                'next-input-group--prepend': $slots.prepend,
                'next-input--prefix': $slots.prefix,
                'next-input--suffix': $slots.suffix || clearable,
                'is-disabled': inputDisabled,
                'is-focus': focused,
                'is-error': validateState === 'error',
            }
        ]"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
    >
        <template v-if="type !== 'textarea'">
            <div v-if="$slots.prepend" class="next-input-group__prepend">
                <slot name="prepend" />
            </div>
            <span v-if="$slots.prefix" class="next-input__prefix">
                <slot name="prefix" />
            </span>
            <input
                v-if="type !== 'textarea'"
                ref="input"
                v-bind="$attrs"
                class="next-input__inner"
                :type="showPassword ? (passwordVisible ? 'text': 'password') : type"
                :disabled="inputDisabled"
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
            <div v-if="$slots.append || $scopedSlots.append" class="next-input-group__append">
                <slot name="append" :length="nativeInputLength" />
            </div>
        </template>
        <textarea
            v-else
            ref="textarea"
            class="next-textarea__inner"
            :value="nativeInputValue"
            v-bind="$attrs"
            :disabled="inputDisabled"
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

        <div v-if="validateState === 'error' && validateErrors" class="next-form__error">
            <slot name="error" :error="validateErrors">
                {{ validateErrors }}
            </slot>
        </div>
        <div v-else-if="$slots.tip" class="next-form__tip">
            <slot name="tip" />
        </div>
    </div>
</template>

<script>
import calcTextareaHeight from './calcTextareaHeight';

export default {
    name: 'NextInput',
    componentName: 'NextInput',
    inheritAttrs: false,
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
        pattern: null,
        patternNotArrow: Boolean,
        isByteLength: Boolean,
    },

    inject: {
        nextForm: {
            default: null,
        },
        nextFormItem: {
            default: null,
        },
    },

    data() {
        return {
            textareaCalcStyle: {},
            hovering: false,
            focused: false,
            isComposing: false,
            passwordVisible: false,
        };
    },

    computed: {
        textareaStyle() {
            return Object.assign({}, this.textareaCalcStyle, { resize: this.resize });
        },
        nextFormSize() {
            return (this.nextFormItem && this.nextFormItem.size) || (this.nextForm && this.nextForm.size);
        },
        inputSize() {
            return this.size || this.nextFormSize;
        },
        inputDisabled() {
            return this.disabled;
        },
        nativeInputValue() {
            return (this.value === null || this.value === undefined) ? '' : this.value;
        },
        nativeInputLength() {
            return this.getInputLength(this.nativeInputValue);
        },
        maxLength() {
            return parseInt(this.max, 10) || 0;
        },
        showClear() {
            return this.clearable
                && !this.inputDisabled
                && !this.readonly
                && this.nativeInputValue
                && (this.focused || this.hovering);
        },
        showPwdVisible() {
            return this.showPassword
                && !this.inputDisabled
                && !this.readonly
                && (!!this.nativeInputValue || this.focused);
        },
    },

    watch: {
        value(val) {
            this.$nextTick(this.resizeTextarea);
        },
        nativeInputValue() {
            this.setNativeInputValue();
        },
        type() {
            this.$nextTick(() => {
                this.setNativeInputValue();
                this.resizeTextarea();
            });
        },
        focused(val) {
            this.dispatch('NextInputGroup', 'focus', val);
        },
        hovering(val) {
            this.dispatch('NextInputGroup', 'hover', val);
        },
    },

    created() {
        this.$on('inputSelect', this.select);
        this.validator('init', this.value, this).catch(console.warn);
    },

    mounted() {
        this.setNativeInputValue();
        this.resizeTextarea();

        if (this.nextForm && this.nextForm.addField) {
            this.nextForm.addField(this);
        }
    },

    beforeDestroy() {
        if (this.nextForm && this.nextForm.removeField) {
            this.nextForm.removeField(this);
        }
    },

    methods: {
        reset() {
            this.clear();
            this.clearValidate();
            return Promise.resolve();
        },
        focus() {
            const input = (this.$refs.input || this.$refs.textarea);
            if (input) {
                input.focus();
            }
        },
        blur() {
            const input = (this.$refs.input || this.$refs.textarea);
            if (input) {
                input.blur();
            }
        },
        resizeTextarea() {
            if (this.$isServer || this.$isMiniapp) return;
            const { autosize, type } = this;
            if (type !== 'textarea') return;
            if (!autosize) {
                this.textareaCalcStyle = {
                    minHeight: calcTextareaHeight(this.$refs.textarea).minHeight,
                };
                return;
            }
            const minRows = autosize.minRows;
            const maxRows = autosize.maxRows;

            this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
        },
        getInput() {
            return this.$refs.input || this.$refs.textarea;
        },
        getInputLength(val) {
            return this.isByteLength
                ? val.replace(/[^\u0000-\u1099\u1d00-\u1dbf]/gm, '**').length // eslint-disable-line no-control-regex
                : val.length;
        },
        setNativeInputValue() {
            const input = this.getInput();
            if (!input) return;
            if (input.value === this.nativeInputValue) return;
            input.value = this.nativeInputValue;
        },
        onBlur(event) {
            this.focused = false;
            this.$emit('blur', event);
            if (this.validateEvent) {
                this.validator('blur', event.target.value).catch(console.warn);
            }
        },
        onFocus(event) {
            this.focused = true;
            this.$emit('focus', event);
            if (this.validateEvent) {
                this.validator('focus', event.target.value).catch(console.warn);
            }
        },
        onInput(event) {
            // should not emit input during composition
            if (this.isComposing) return;

            const value = event.target.value;

            // should remove the following line when we don't support IE
            if (value === this.nativeInputValue) return;

            const length = this.getInputLength(value);

            // 限制最大输入字符
            if (this.maxLength && length > this.maxLength) {
                this.$nextTick(this.setNativeInputValue);
                return;
            }

            // 输入限制
            if (this.pattern) {
                if (this.pattern instanceof RegExp) {
                    if (this.pattern.test(value)) {
                        this.setCurrentValue(value);
                    } else if (this.patternNotArrow) {
                        this.$nextTick(this.setNativeInputValue);
                    }
                    return;
                }
                if (typeof this.pattern === 'function') {
                    if (this.pattern(value, length)) {
                        this.setCurrentValue(value);
                    } else if (this.patternNotArrow) {
                        this.$nextTick(this.setNativeInputValue);
                    }
                    return;
                }
            }

            this.setCurrentValue(value);
        },
        setCurrentValue(value) {
            this.$emit('input', value);

            // ensure native input value is controlled
            this.$nextTick(this.setNativeInputValue);

            if (this.validateEvent) {
                this.validator('input', value).catch(console.warn);
            }
        },
        onChange(event) {
            this.$emit('change', event.target.value);
            if (this.validateEvent) {
                this.validator('change', event.target.value).catch(console.warn);
            }
        },
        onEnter(event) {
            this.$emit('enter', event);
        },
        onKeyup(event) {
            this.$emit('keyup', event);
        },
        handlePasswordVisible() {
            this.passwordVisible = !this.passwordVisible;
            this.focus();
        },
        handleCompositionStart(event) {
            this.isComposing = true;
            this.$emit('compositionstart', event);
        },
        handleCompositionEnd(event) {
            this.isComposing = false;
            this.onInput(event);
            this.$emit('compositionend', event);
        },
        handleCompositionUpdate(event) {
            this.isComposing = false;
            this.onInput(event);
            this.$emit('compositionupdate', event);
        },
        clear() {
            this.$emit('input', '');
            this.$emit('change', '');
            this.$emit('clear');
        },
        select() {
            (this.$refs.input || this.$refs.textarea).select();
        },
    },
};
</script>
