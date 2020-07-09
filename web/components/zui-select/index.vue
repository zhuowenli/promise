<template>
    <div
        :id="id"
        ref="select"
        v-clickoutside="handleClose"
        class="hlg-select"
        :class="{'is-error': validateState === 'error'}"
        @click.stop="toggleMenu"
    >
        <div
            v-if="isMiniapp"
            ref="reference"
            class="hlg-input"
            :class="{ 'is-focus': visible }"
        >
            <div class="hlg-input__inner">
                <span v-if="selectedLabel">{{ selectedLabel }}</span>
                <span v-else class="hlg-input__inner-placeholder">{{ currentPlaceholder }}</span>
            </div>
            <span class="hlg-input__suffix">
                <i slot="suffix" class="hlg-select__icon hlg-icon-caret-bottom" :class="{'is-active': visible}" />
            </span>
        </div>

        <template v-else>
            <div
                v-if="multiple"
                ref="tags"
                class="hlg-select__tags"
                :class="{'is-collapse': collapseTags}"
                :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }"
            >
                <span v-if="collapseTags && selected.length">
                    <HlgTag
                        :closable="!selectDisabled"
                        :size="collapseTagSize"
                        :hit="selected[0].hitState"
                        type="info"
                        disable-transitions
                        :style="{ 'max-width': inputWidth - 32 + 'px' }"
                        @close="deleteTag($event, selected[0])"
                    >
                        {{ selected[0].currentLabel }}
                    </HlgTag>
                    <span
                        v-if="selected.length > 1"
                        class="hlg-select__tags-text"
                    >
                        等共{{ selected.length }}个
                    </span>
                </span>

                <TransitionGroup v-if="!collapseTags" @after-leave="resetInputHeight">
                    <HlgTag
                        v-for="item in selected"
                        :key="getValueKey(item)"
                        :closable="!selectDisabled"
                        :size="collapseTagSize"
                        :hit="item.hitState"
                        type="info"
                        disable-transitions
                        @close="deleteTag($event, item)"
                    >
                        <span class="hlg-select__tags-text">{{ item.currentLabel }}</span>
                    </HlgTag>
                </TransitionGroup>

                <input
                    v-if="filterable"
                    ref="input"
                    v-model="query"
                    type="text"
                    class="hlg-select__input"
                    :class="[selectSize ? `is-${ selectSize }` : '']"
                    :disabled="selectDisabled"
                    :autocomplete="autocomplete"
                    :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }"
                    @focus="handleFocus"
                    @blur="softFocus = false"
                    @click.stop
                    @keyup="managePlaceholder"
                    @keydown="resetInputState"
                    @keydown.down.prevent="navigateOptions('next')"
                    @keydown.up.prevent="navigateOptions('prev')"
                    @keydown.enter.prevent="selectOption"
                    @keydown.esc.stop.prevent="visible = false"
                    @keydown.delete="deletePrevTag"
                    @compositionstart="handleComposition"
                    @compositionupdate="handleComposition"
                    @compositionend="handleComposition"
                    @input="debouncedQueryChange"
                >
            </div>

            <HlgInput
                ref="reference"
                v-model="selectedLabel"
                type="text"
                :placeholder="currentPlaceholder"
                :name="name"
                :autocomplete="autocomplete"
                :size="selectSize"
                :disabled="selectDisabled"
                :readonly="readonly"
                :class="{ 'is-focus': visible }"
                :validate-event="false"
                @focus="handleFocus"
                @blur="handleBlur"
                @keyup.native="onInputChange"
                @keydown.native.down.stop.prevent="navigateOptions('next')"
                @keydown.native.up.stop.prevent="navigateOptions('prev')"
                @keydown.native.enter.prevent="selectOption"
                @keydown.native.esc.stop.prevent="visible = false"
                @keydown.native.tab="visible = false"
                @paste.native="onInputChange"
                @mouseenter.native="inputHovering = true"
                @mouseleave.native="inputHovering = false"
            >
                <i slot="suffix" class="hlg-select__icon hlg-icon-caret-bottom" :class="{'is-active': visible}" />
            </HlgInput>
        </template>

        <div v-if="validateState === 'error' && validateErrors" class="hlg-form__error">
            <slot name="error" :error="validateErrors">
                {{ validateErrors }}
            </slot>
        </div>
        <div v-else-if="$slots.tip" class="hlg-form__tip">
            <slot name="tip" />
        </div>

        <HlgSelectDropdown
            ref="popper"
            :append-to-body="popperAppendToBody"
        >
            <HlgScrollbar
                ref="scrollbar"
                tag="ul"
                wrap-class="hlg-select-dropdown__wrap"
                view-class="hlg-select-dropdown__list"
            >
                <HlgOption
                    v-if="showNewOption"
                    created
                    :value="query"
                />
                <slot />
                <p
                    v-if="emptyText && !isVisibleFirstTime && (!allowCreate || loading || (allowCreate && !options.length ))"
                    class="hlg-select-dropdown__empty"
                >
                    {{ emptyText }}
                </p>
            </HlgScrollbar>
            <div v-if="$slots.footer" class="hlg-select-dropdown__footer">
                <slot name="footer" />
            </div>
        </HlgSelectDropdown>
    </div>
</template>

<script>
import Clickoutside from '@directives/clickoutside';
import validator from '@mixins/validate';
import { getStyle } from '@services/dom';
import scrollIntoView from '@services/scroll-into-view';
import { getValueByPath, valueEquals, isIE, isEdge } from '@services/util';
import Emitter from '@mixins/emitter';
import HlgInput from 'hlg-ui/packages/input';
import HlgScrollbar from 'hlg-ui/packages/scrollbar';
import { debounce } from 'throttle-debounce';
import HlgOption from './option';
import HlgSelectDropdown from './select-dropdown';

export default {
    name: 'HlgSelect',
    componentName: 'HlgSelect',
    components: { HlgInput, HlgOption, HlgSelectDropdown, HlgScrollbar },
    directives: { Clickoutside },
    mixins: [Emitter, validator],

    provide() {
        return {
            select: this,
        };
    },

    props: {
        name: {
            type: String,
            default: '',
        },
        id: {
            type: String,
            default: '',
        },
        value: {
            required: true,
            type: null,
        },
        autocomplete: {
            type: String,
            default: 'off',
        },
        automaticDropdown: Boolean,
        size: {
            type: String,
            default: '',
        },
        debounce: {
            type: Number,
            default: 300,
        },
        collapseTags: Boolean,
        disabled: Boolean,
        filterable: Boolean,
        allowCreate: Boolean,
        loading: Boolean,
        reserveKeyword: Boolean,
        popperClass: {
            type: String,
            default: '',
        },
        popperWidth: {
            type: [Number, String],
            default: 0,
        },
        loadingText: {
            type: String,
            default: '',
        },
        noMatchText: {
            type: String,
            default: '',
        },
        noDataText: {
            type: String,
            default: '',
        },
        filterMethod: {
            type: Function,
            default: null,
        },
        multiple: Boolean,
        placeholder: {
            type: String,
            default: '请输入内容',
        },
        defaultFirstOption: Boolean,
        valueKey: {
            type: String,
            default: 'value',
        },
        popperAppendToBody: {
            type: Boolean,
            default: true,
        },
        multipleLimit: {
            type: Number,
            default: 0,
        },
    },

    data() {
        return {
            isMiniapp: this.$isMiniapp,
            options: [],
            cachedOptions: [],
            createdLabel: null,
            createdSelected: false,
            selected: this.multiple ? [] : {},
            inputLength: 20,
            inputWidth: 0,
            initialInputHeight: 0,
            cachedPlaceHolder: '',
            optionsCount: 0,
            filteredOptionsCount: 0,
            visible: false,
            softFocus: false,
            selectedLabel: '',
            hoverIndex: -1,
            query: '',
            previousQuery: null,
            inputHovering: false,
            currentPlaceholder: '',
            menuVisibleOnFocus: false,
            isOnComposition: false,
            isSilentBlur: false,
            isVisibleFirstTime: false,
            hoverOption: -1,
        };
    },

    inject: {
        hlgForm: {
            default: null,
        },
    },

    computed: {
        readonly() {
            return !this.filterable || this.multiple || (!isIE() && !isEdge() && !this.visible);
        },

        emptyText() {
            if (this.loading) {
                return this.loadingText || '加载中';
            }

            if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
                return this.noMatchText || '无匹配数据';
            }

            if (this.options.length === 0) {
                return this.noDataText || '无数据';
            }

            return null;
        },

        showNewOption() {
            const hasExistingOption = this.options.filter(option => !option.created)
                .some(option => option.currentLabel === this.query);
            return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
        },

        selectSize() {
            return this.size;
        },

        selectDisabled() {
            return this.disabled;
        },

        collapseTagSize() {
            return ['small', 'mini'].indexOf(this.selectSize) > -1 ? 'mini' : 'small';
        },

        optionsAllDisabled() {
            return this.options.filter(option => option.visible).every(option => option.disabled);
        },
    },

    watch: {
        selectDisabled() {
            this.$nextTick(() => {
                this.resetInputHeight();
            });
        },

        placeholder(val) {
            this.currentPlaceholder = val;
            this.cachedPlaceHolder = val;
        },

        value(val, oldVal) {
            if (this.multiple) {
                this.resetInputHeight();
                if (val.length > 0 || (this.$refs.input && this.query !== '')) {
                    this.currentPlaceholder = '';
                } else {
                    this.currentPlaceholder = this.cachedPlaceHolder;
                }
                if (this.filterable && !this.reserveKeyword) {
                    this.query = '';
                    this.handleQueryChange(this.query);
                }
            }

            this.setSelected();

            if (this.filterable && !this.multiple) {
                this.inputLength = 20;
            }
            if (!valueEquals(val, oldVal)) {
                this.dispatch('HlgFormItem', 'hlg.form.change', val);
            }
        },

        visible(val) {
            if (!val) {
                this.broadcast('HlgSelectDropdown', 'destroyPopper');
                if (this.$refs.input) {
                    this.$refs.input.blur();
                }
                this.query = '';
                this.previousQuery = null;
                this.selectedLabel = '';
                this.inputLength = 20;
                this.menuVisibleOnFocus = false;
                this.resetHoverIndex();
                this.$nextTick(() => {
                    if (this.$refs.input
                        && this.$refs.input.value === ''
                        && this.selected.length === 0) {
                        this.currentPlaceholder = this.cachedPlaceHolder;
                    }
                });
                if (!this.multiple) {
                    if (this.selected) {
                        if (this.filterable && this.allowCreate && this.createdSelected && this.createdLabel) {
                            this.selectedLabel = this.createdLabel;
                        } else {
                            this.selectedLabel = this.selected.currentLabel;
                        }
                        if (this.filterable) this.query = this.selectedLabel;
                    }
                }
            } else {
                this.broadcast('HlgSelectDropdown', 'updatePopper');

                if (this.filterable) {
                    this.query = this.remote ? '' : this.selectedLabel;
                    this.handleQueryChange(this.query);
                    if (this.multiple) {
                        this.$refs.input.focus();
                    } else {
                        if (!this.remote) {
                            this.broadcast('HlgOption', 'queryChange', '');
                            this.broadcast('HlgOptionGroup', 'queryChange');
                            this.isVisibleFirstTime = !!this.options.length;
                        }
                        this.broadcast('HlgInput', 'inputSelect');
                    }
                }
            }

            this.broadcast('HlgSelectDropdown', 'visible', val);
            this.$emit('visible-change', val);
        },

        options() {
            if (this.$isServer) return;
            this.$nextTick(() => {
                this.broadcast('HlgSelectDropdown', 'updatePopper');
            });

            if (this.multiple) {
                this.resetInputHeight();
            }

            const inputs = this.$el.querySelectorAll('input');
            if ([].indexOf.call(inputs, document.activeElement) === -1) {
                this.setSelected();
            }
            if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
                this.checkDefaultFirstOption();
            }
        },

        hoverIndex(val) {
            if (typeof val === 'number' && val > -1) {
                this.hoverOption = this.options[val] || {};
            }
            this.options.forEach(option => {
                option.hover = this.hoverOption === option;
            });
        },
    },

    created() {
        this.currentPlaceholder = this.placeholder;
        this.cachedPlaceHolder = this.placeholder;
        if (this.multiple && !Array.isArray(this.value)) {
            this.$emit('input', []);
        }
        if (!this.multiple && Array.isArray(this.value)) {
            this.$emit('input', '');
        }

        this.debouncedOnInputChange = debounce(this.debounce, () => {
            this.onInputChange();
        });

        this.debouncedQueryChange = debounce(this.debounce, (e) => {
            this.handleQueryChange(e.target.value);
        });

        this.$on('handleOptionClick', this.handleOptionSelect);
        this.$on('setSelected', this.setSelected);
        this.validator('init', this.value, this).catch(console.warn);

        if (this.hlgForm && this.hlgForm.addField) {
            this.hlgForm.addField(this);
        }
    },

    beforeDestroy() {
        if (this.hlgForm && this.hlgForm.removeField) {
            this.hlgForm.removeField(this);
        }
    },

    async mounted() {
        if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
            this.currentPlaceholder = '';
        }

        const reference = this.$refs.reference;
        const sizeMap = { medium: 36, small: 32, mini: 28 };

        if (reference) {
            if (this.$isMiniapp) {
                const rect = await reference.$$getBoundingClientRect();
                this.initialInputHeight = rect.height || sizeMap[this.selectSize];
            } else if (reference.$el) {
                this.initialInputHeight = reference.$el.getBoundingClientRect().height || sizeMap[this.selectSize];
            }
        }

        if (this.remote && this.multiple) {
            this.resetInputHeight();
        }

        this.$nextTick(async () => {
            if (reference) {
                if (this.$isMiniapp) {
                    const rect = await reference.$$getBoundingClientRect();
                    this.inputWidth = rect.width;
                } else if (reference.$el) {
                    this.inputWidth = reference.$el.getBoundingClientRect().width;
                }
            }
        });

        this.setSelected();
    },

    updated() {
        if (this.inputWidth) return;

        this.$nextTick(async () => {
            const { reference } = this.$refs;

            if (reference) {
                // fixed：修复 vue-loader hot-reload 导致样式晚加载问题
                if (this.$isMiniapp) {
                    await this.styleRender(reference);
                    const rect = await reference.$$getBoundingClientRect();
                    this.inputWidth = rect.width;
                } else if (reference.$el) {
                    await this.styleRender(reference.$el);
                    this.inputWidth = reference.$el.getBoundingClientRect().width;
                }
            }
        });
    },

    methods: {
        reset() {
            this.clear();
            this.clearValidate();
            return Promise.resolve();
        },
        clear() {
            this.$emit('input', '');
            this.$emit('change', '');
            this.$emit('clear');
        },
        styleRender($el) {
            if (this.$isTest || this.$isMiniapp) return;
            let display = getStyle($el, 'display');

            if (display && display !== 'block') {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                const inter = setInterval(() => {
                    display = getStyle($el, 'display');
                    if (display && display !== 'block') {
                        clearInterval(inter);
                        resolve($el);
                    }
                }, 100);
            });
        },
        handleComposition(event) {
            const text = event.target.value;
            if (event.type === 'compositionend') {
                this.isOnComposition = false;
                this.handleQueryChange(text);
            } else {
                this.isOnComposition = true;
            }
        },
        deletePrevTag(e) {
            if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
                const value = this.value.slice();
                value.pop();
                this.$emit('input', value);
                this.emitChange(value);
            }
        },
        handleQueryChange(val) {
            this.isVisibleFirstTime = false;
            if (this.previousQuery === val || this.isOnComposition) return;

            if (this.previousQuery === null && typeof this.filterMethod === 'function') {
                this.previousQuery = val;
                return;
            }

            this.previousQuery = val;
            this.$nextTick(() => {
                if (this.visible) this.broadcast('HlgSelectDropdown', 'updatePopper');
            });
            this.hoverIndex = -1;

            if (typeof this.filterMethod === 'function') {
                this.filterMethod(val);
                this.broadcast('HlgOptionGroup', 'queryChange');
            } else {
                this.filteredOptionsCount = this.optionsCount;
                this.broadcast('HlgOption', 'queryChange', val);
                this.broadcast('HlgOptionGroup', 'queryChange');
            }

            if (this.defaultFirstOption && this.filterable && this.filteredOptionsCount) {
                this.checkDefaultFirstOption();
            }
        },

        scrollToOption(option) {
            const target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;
            if (this.$refs.popper && target) {
                const menu = this.$refs.popper.$el.querySelector('.hlg-select-dropdown__wrap');
                scrollIntoView(menu, target);
            }
            if (this.$refs.scrollbar) this.$refs.scrollbar.handleScroll();
        },

        emitChange(val) {
            if (!valueEquals(this.value, val)) {
                this.$emit('change', val);
                if (this.validateEvent) {
                    this.validator('change', val).catch(console.warn);
                }
            }
        },

        getOption(value) {
            let option;
            const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
            const isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]';

            for (let i = this.cachedOptions.length - 1; i >= 0; i--) { // eslint-disable-line no-plusplus
                const cachedOption = this.cachedOptions[i];
                const isEqual = isObject
                    ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
                    : cachedOption.value === value;
                if (isEqual) {
                    option = cachedOption;
                    break;
                }
            }
            if (option) return option;
            const label = (!isObject && !isNull)
                ? value : '';
            const newOption = {
                value,
                currentLabel: label,
            };
            if (this.multiple) {
                newOption.hitState = false;
            }
            return newOption;
        },

        setSelected() {
            if (!this.multiple) {
                const option = this.getOption(this.value);
                if (option.created) {
                    this.createdLabel = option.currentLabel;
                    this.createdSelected = true;
                } else {
                    this.createdSelected = false;
                }
                this.selectedLabel = option.currentLabel;
                this.selected = option;
                if (this.filterable) this.query = this.selectedLabel;
                return;
            }
            const result = [];
            if (Array.isArray(this.value)) {
                this.value.forEach(value => {
                    result.push(this.getOption(value));
                });
            }
            this.selected = result;
            this.$nextTick(() => {
                this.resetInputHeight();
            });
        },

        handleFocus(event) {
            if (!this.softFocus) {
                if (this.automaticDropdown || this.filterable) {
                    this.visible = true;
                    this.menuVisibleOnFocus = true;
                }
                this.$emit('focus', event);
            } else {
                this.softFocus = false;
            }
        },

        blur() {
            this.visible = false;
            this.$refs.reference.blur();
        },

        handleBlur(event) {
            setTimeout(() => {
                if (this.isSilentBlur) {
                    this.isSilentBlur = false;
                } else {
                    this.$emit('blur', event);
                }
            }, 50);
            this.softFocus = false;
        },

        handleClose() {
            this.visible = false;
        },

        managePlaceholder() {
            if (this.currentPlaceholder !== '') {
                this.currentPlaceholder = this.$refs.input.value ? '' : this.cachedPlaceHolder;
            }
        },

        deleteSelected(event) {
            event.stopPropagation();
            const value = this.multiple ? [] : null;
            this.$emit('input', value);
            this.emitChange(value);
            this.visible = false;
            this.$emit('clear');
        },

        deleteTag(event, tag) {
            const index = this.selected.indexOf(tag);
            if (index > -1 && !this.selectDisabled) {
                const value = this.value.slice();
                value.splice(index, 1);
                this.$emit('input', value);
                this.emitChange(value);
                this.$emit('remove-tag', tag.value);
            }
            event.stopPropagation();
        },

        resetInputState(e) {
            if (e.keyCode !== 8) this.toggleLastOptionHitState(false);

            this.inputLength = this.$refs.input.value.length * 15 + 20;
            this.resetInputHeight();
        },

        resetInputHeight() {
            if (this.collapseTags && !this.filterable) return;
            this.$nextTick(() => {
                if (!this.$refs.reference) return;
                const input = this.$refs.reference.$el;
                const tags = this.$refs.tags;
                const sizeInMap = this.initialInputHeight || 34;

                input.style.height = this.selected.length === 0
                    ? `${sizeInMap}px`
                    : `${Math.max(
                        tags ? (tags.clientHeight + (tags.clientHeight > sizeInMap ? 6 : 0)) : 0,
                        sizeInMap,
                    )}px`;

                if (this.visible && this.emptyText !== false) {
                    this.broadcast('HlgSelectDropdown', 'updatePopper');
                }
            });
        },

        toggleLastOptionHitState(hit) {
            if (!Array.isArray(this.selected)) return;
            const option = this.selected[this.selected.length - 1];
            if (!option) return;

            if (hit === true || hit === false) {
                option.hitState = hit;
                return hit;
            }

            option.hitState = !option.hitState;
            return option.hitState;
        },

        resetHoverIndex() {
            setTimeout(() => {
                if (!this.multiple) {
                    this.hoverIndex = this.options.indexOf(this.selected);
                } else if (this.selected.length > 0) {
                    this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)));
                } else {
                    this.hoverIndex = -1;
                }
            }, 300);
        },

        handleOptionSelect(option, byClick) {
            if (this.multiple) {
                const value = this.value.slice();
                const optionIndex = this.getValueIndex(value, option.value);

                if (optionIndex > -1) {
                    value.splice(optionIndex, 1);
                } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
                    value.push(option.value);
                }

                this.$emit('input', value);
                this.emitChange(value);
                if (option.created) {
                    this.query = '';
                    this.handleQueryChange('');
                    this.inputLength = 20;
                }
                if (this.filterable) this.$refs.input.focus();
            } else {
                this.$emit('input', option.value);
                this.emitChange(option.value);
                this.visible = false;
            }

            if (!this.$isMiniapp) {
                this.isSilentBlur = byClick;
                this.setSoftFocus();
            }

            if (this.visible) return;
            this.$nextTick(() => {
                this.scrollToOption(option);
            });
        },

        setSoftFocus() {
            this.softFocus = true;
            const input = this.$refs.input || this.$refs.reference;

            if (input) {
                input.focus();
            }
        },

        getValueIndex(arr = [], value) {
            const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
            if (!isObject) {
                return arr.indexOf(value);
            }
            const valueKey = this.valueKey;
            let index = -1;
            arr.some((item, i) => {
                if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
                    index = i;
                    return true;
                }
                return false;
            });
            return index;
        },

        toggleMenu() {
            if (!this.selectDisabled) {
                if (this.menuVisibleOnFocus) {
                    this.menuVisibleOnFocus = false;
                } else {
                    this.visible = !this.visible;
                }

                const input = (this.$refs.input || this.$refs.reference);
                if (this.visible && input && !this.$isMiniapp) {
                    input.focus();
                }

                // 下拉框弹出时重新计算滚动条高度
                if (this.$refs.scrollbar) {
                    this.$nextTick(() => this.$refs.scrollbar.update());
                }
            }
        },

        selectOption() {
            if (!this.visible) {
                this.toggleMenu();
            } else if (this.options[this.hoverIndex]) {
                this.handleOptionSelect(this.options[this.hoverIndex]);
            }
        },

        onInputChange() {
            if (this.filterable && this.query !== this.selectedLabel) {
                this.query = this.selectedLabel;
                this.handleQueryChange(this.query);
            }
        },

        onOptionDestroy(index) {
            if (index > -1) {
                this.optionsCount -= 1;
                this.filteredOptionsCount -= 1;
                this.options.splice(index, 1);
            }
        },

        checkDefaultFirstOption() {
            this.hoverIndex = -1;
            // highlight the created option
            let hasCreated = false;
            for (let i = this.options.length - 1; i >= 0; i -= 1) {
                if (this.options[i].created) {
                    hasCreated = true;
                    this.hoverIndex = i;
                    break;
                }
            }
            if (hasCreated) return;

            for (let i = 0; i !== this.options.length; ++i) { // eslint-disable-line no-plusplus
                const option = this.options[i];
                if (this.query) {
                    // highlight first options that passes the filter
                    if (!option.disabled && !option.groupDisabled && option.visible) {
                        this.hoverIndex = i;
                        break;
                    }
                } else if (option.itemSelected) {
                    // highlight currently selected option
                    this.hoverIndex = i;
                    break;
                }
            }
        },

        getValueKey(item) {
            if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
                return item.value;
            }
            return getValueByPath(item.value, this.valueKey);
        },

        navigateOptions(direction) {
            if (!this.visible) {
                this.visible = true;
                return;
            }
            if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
            if (!this.optionsAllDisabled) {
                if (direction === 'next') {
                    this.hoverIndex += 1;
                    if (this.hoverIndex === this.options.length) {
                        this.hoverIndex = 0;
                    }
                } else if (direction === 'prev') {
                    this.hoverIndex -= 1;
                    if (this.hoverIndex < 0) {
                        this.hoverIndex = this.options.length - 1;
                    }
                }
                const option = this.options[this.hoverIndex];
                if (option.disabled === true
                    || option.groupDisabled === true
                    || !option.visible
                ) {
                    this.navigateOptions(direction);
                }
                this.$nextTick(() => this.scrollToOption(this.hoverOption));
            }
        },
    },
};
</script>
