/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-26 14:40:15
 */

import { VuexStore, State } from '@vue/runtime-core';
// import { cloneDeep } from 'lodash';
import merge = require('deepmerge');
const ElectronStore = window.require('electron-store');

const STORAGE_NAME = 'vuex';
const STORAGE_KEY = 'state';
const STORAGE_TEST_KEY = 'test';

class PersistedState {
    options: any;
    store: VuexStore;
    whitelist: any;
    blacklist: any;

    constructor(options: any, store: VuexStore) {
        this.options = options;
        this.store = store;
    }

    loadOptions() {
        if (!this.options.storage) this.options.storage = this.createStorage();
        if (!this.options.storageKey) this.options.storageKey = STORAGE_KEY;

        this.whitelist = this.loadFilter(this.options.whitelist, 'whitelist');
        this.blacklist = this.loadFilter(this.options.blacklist, 'blacklist');
    }

    createStorage() {
        return new ElectronStore({ name: this.options.storageName || STORAGE_NAME });
    }

    getState() {
        return this.options.storage.get(this.options.storageKey);
    }

    setState(state: State) {
        this.options.storage.set(this.options.storageKey, state);
    }

    loadFilter(filter: any, name: string) {
        if (!filter) {
            return null;
        } else if (filter instanceof Array) {
            return this.filterInArray(filter);
        } else if (typeof filter === 'function') {
            return filter;
        } else {
            throw new Error(`[Vuex Electron] Filter "${name}" should be Array or Function. Please, read the docs.`);
        }
    }

    filterInArray(list: any) {
        return (mutation: any) => {
            return list.includes(mutation.type);
        };
    }

    checkStorage() {
        try {
            this.options.storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY);
            this.options.storage.get(STORAGE_TEST_KEY);
            this.options.storage.delete(STORAGE_TEST_KEY);
        } catch (error) {
            throw new Error('[Vuex Electron] Storage is not valid. Please, read the docs.');
        }
    }

    combineMerge(target: any, source: any, options: any) {
        const emptyTarget = (value: any) => (Array.isArray(value) ? [] : {});
        const clone = (value: any, options: any) => merge(emptyTarget(value), value, options);
        const destination = target.slice();

        source.forEach(function (e: any, i: any) {
            if (typeof destination[i] === 'undefined') {
                const cloneRequested = options.clone !== false;
                const shouldClone = cloneRequested && options.isMergeableObject(e);
                destination[i] = shouldClone ? clone(e, options) : e;
            } else if (options.isMergeableObject(e)) {
                destination[i] = merge(target[i], e, options);
            } else if (target.indexOf(e) === -1) {
                destination.push(e);
            }
        });

        return destination;
    }

    async loadInitialState() {
        const state = await this.getState();

        if (state) {
            const mergedState = merge(this.store.state, state, { arrayMerge: this.combineMerge });
            this.store.replaceState(mergedState);
        }
    }

    subscribeOnChanges() {
        this.store.subscribe((mutation, state) => {
            if (this.blacklist && this.blacklist(mutation)) return;
            if (this.whitelist && !this.whitelist(mutation)) return;

            this.setState(state);
        });
    }
}

export default (options = {}) => (store: VuexStore) => {
    const persistedState = new PersistedState(options, store);

    persistedState.loadOptions();
    persistedState.checkStorage();
    persistedState.loadInitialState();
    persistedState.subscribeOnChanges();
};
