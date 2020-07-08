<template>
    <div class="container">
        <div id="editor" ref="editor" />
    </div>
</template>

<script lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import 'monaco-editor/esm/vs/editor/edcore.main';

export default {
    name: 'ElectronVue',
    mounted() {
        const { editor } = this.$refs;

        monaco.editor.defineTheme('one-dark-pro', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'activityBar.background': '#282c34',
                'activityBar.foreground': '#d7dae0',
                'activityBarBadge.background': '#4d78cc',
                'activityBarBadge.foreground': '#f8fafd',
                'badge.background': '#282c34',
                'button.background': '#404754',
                'debugToolBar.background': '#21252b',
                'diffEditor.insertedTextBackground': '#00809b33',
                'dropdown.background': '#21252b',
                'dropdown.border': '#21252b',
                'editor.background': '#282c34',
                'editor.findMatchBackground': '#42557b',
                'editor.findMatchBorder': '#457dff',
                'editor.findMatchHighlightBackground': '#6199ff2f',
                'editor.foreground': '#abb2bf',
                'editor.lineHighlightBackground': '#2c313c',
                'editor.selectionBackground': '#67769660',
                'editor.selectionHighlightBackground': '#ffffff10',
                'editor.selectionHighlightBorder': '#dddddd',
                'editor.wordHighlightBackground': '#d2e0ff2f',
                'editor.wordHighlightBorder': '#7f848e',
                'editor.wordHighlightStrongBackground': '#abb2bf26',
                'editor.wordHighlightStrongBorder': '#7f848e',
                'editorActiveLineNumber.foreground': '#737984',
                'editorBracketMatch.background': '#515a6b',
                'editorBracketMatch.border': '#515a6b',
                'editorCursor.background': '#ffffffc9',
                'editorCursor.foreground': '#528bff',
                'editorError.foreground': '#c24038',
                'editorGroup.background': '#181a1f',
                'editorGroup.border': '#181a1f',
                'editorGroupHeader.tabsBackground': '#21252b',
                'editorHoverWidget.background': '#21252b',
                'editorHoverWidget.border': '#181a1f',
                'editorIndentGuide.activeBackground': '#c8c8c859',
                'editorIndentGuide.background': '#3b4048',
                'editorLineNumber.foreground': '#495162',
                'editorMarkerNavigation.background': '#21252b',
                'editorRuler.foreground': '#abb2bf26',
                'editorSuggestWidget.background': '#21252b',
                'editorSuggestWidget.border': '#181a1f',
                'editorSuggestWidget.selectedBackground': '#2c313a',
                'editorWarning.foreground': '#d19a66',
                'editorWhitespace.foreground': '#3b4048',
                'editorWidget.background': '#21252b',
                focusBorder: '#464646',
                'input.background': '#1d1f23',
                'list.activeSelectionBackground': '#2c313a',
                'list.activeSelectionForeground': '#d7dae0',
                'list.focusBackground': '#383e4a',
                'list.highlightForeground': '#c5c5c5',
                'list.hoverBackground': '#292d35',
                'list.inactiveSelectionBackground': '#2c313a',
                'list.inactiveSelectionForeground': '#d7dae0',
                'list.warningForeground': '#d19a66',
                'menu.foreground': '#c8c8c8',
                'panelSectionHeader.background': '#21252b',
                'peekViewEditor.background': '#1b1d23',
                'peekViewEditor.matchHighlightBackground': '#29244b',
                'peekViewResult.background': '#22262b',
                'scrollbarSlider.activeBackground': '#747d9180',
                'scrollbarSlider.background': '#4e566660',
                'scrollbarSlider.hoverBackground': '#5a637580',
                'sideBar.background': '#21252b',
                'sideBarSectionHeader.background': '#282c34',
                'statusBar.background': '#21252b',
                'statusBar.debuggingBackground': '#cc6633',
                'statusBar.debuggingBorder': '#66017a',
                'statusBar.debuggingForeground': '#ffffff',
                'statusBar.foreground': '#9da5b4',
                'statusBar.noFolderBackground': '#21252b',
                'statusBarItem.hoverBackground': '#2c313a',
                'statusBarItem.remoteBackground': '#4d78cc',
                'statusBarItem.remoteForeground': '#f8fafd',
                'tab.activeBackground': '#282c34',
                'tab.activeForeground': '#dcdcdc',
                'tab.border': '#181a1f',
                'tab.hoverBackground': '#323842',
                'tab.inactiveBackground': '#21252b',
                'tab.unfocusedHoverBackground': '#323842',
                'terminal.ansiBlack': '#3f4451',
                'terminal.ansiBlue': '#4aa5f0',
                'terminal.ansiBrightBlack': '#4f5666',
                'terminal.ansiBrightBlue': '#4dc4ff',
                'terminal.ansiBrightCyan': '#4cd1e0',
                'terminal.ansiBrightGreen': '#a5e075',
                'terminal.ansiBrightMagenta': '#de73ff',
                'terminal.ansiBrightRed': '#ff616e',
                'terminal.ansiBrightWhite': '#d7dae0',
                'terminal.ansiBrightYellow': '#f0a45d',
                'terminal.ansiCyan': '#42b3c2',
                'terminal.ansiGreen': '#8cc265',
                'terminal.ansiMagenta': '#c162de',
                'terminal.ansiRed': '#e05561',
                'terminal.ansiWhite': '#e6e6e6',
                'terminal.ansiYellow': '#d18f52',
                'terminal.background': '#282c34',
                'terminal.border': '#abb2bf',
                'terminal.foreground': '#abb2bf',
                'terminal.selectionBackground': '#abb2bf30',
                'textLink.foreground': '#61afef',
                'titleBar.activeBackground': '#282c34',
                'titleBar.activeForeground': '#9da5b4',
                'titleBar.inactiveBackground': '#21252b',
                'titleBar.inactiveForeground': '#6b717d',
            },
        });

        const monacoInstance = monaco.editor.create(editor, {
            value: [
                '## js',
                '\n',
                '```js',
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}',
                '```',
            ].join('\n'),
            language: 'markdown',
            theme: 'one-dark-pro',
            lineDecorationsWidth: 6,
            lineNumbersMinChars: 4,
        });

        monacoInstance.onDidChangeModelContent((event) => {
            const newValue = monacoInstance.getValue();
            console.log(newValue);
        });
        // window.monacoInstance = monacoInstance;
    },
};
</script>

<style lang="scss" src="./stylesheet/index.scss"></style>
