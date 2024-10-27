import { schema } from "prosemirror-schema-basic"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { undo, redo, history } from "prosemirror-history"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { decorations, DecorationConfig } from "./plugins/decorations";

const boldConfig: DecorationConfig = {
    name: "bold",
    regex: /\*\*(.+?)\*\*/g,
    nodeName: "strong"
};

const italicConfig: DecorationConfig = {
    name: "italic",
    regex: /_(.+?)_/g,
    nodeName: "em"
};

const strikethroughConfig: DecorationConfig = {
    name: "strikethrough",
    regex: /~~(.+?)~~/g,
    nodeName: "s"
};


const state = EditorState.create({
    schema, plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo, "Mod-Shift-Z": redo }),
        keymap(baseKeymap),
        decorations([boldConfig, italicConfig, strikethroughConfig]),
    ],
})

const view = new EditorView(document.querySelector('#editor'), {
    state, attributes: { class: 'editor' }, dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction)
        view.updateState(newState)
    }
})
