import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { decorations, DecorationConfig } from './plugins/decorations';
import { blockquotePlugin } from './plugins/blockquotePlugin';

const boldConfig: DecorationConfig = {
    name: 'bold',
    regex: /\*\*(.+?)\*\*/g,
    nodeName: 'strong',
};

const italicConfig: DecorationConfig = {
    name: 'italic',
    regex: /_(.+?)_/g,
    nodeName: 'em',
};

const strikethroughConfig: DecorationConfig = {
    name: 'strikethrough',
    regex: /~~(.+?)~~/g,
    nodeName: 's',
};

const header1Config: DecorationConfig = {
    name: 'header1',
    regex: /^#\s.*/g,
    nodeName: 'h1',
};

const header2Config: DecorationConfig = {
    name: 'header2',
    regex: /^##\s.*/g,
    nodeName: 'h2',
};

const header3Config: DecorationConfig = {
    name: 'header3',
    regex: /^###\s.*/g,
    nodeName: 'h3',
};

const state = EditorState.create({
    schema,
    plugins: [
        history(),
        keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo, 'Mod-Shift-Z': redo }),
        keymap(baseKeymap),
        decorations([boldConfig, italicConfig, strikethroughConfig, header1Config, header2Config, header3Config]),
        blockquotePlugin,
    ],
});

const view = new EditorView(document.querySelector('#editor'), {
    state,
    attributes: { class: 'editor' },
    dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
    },
});
