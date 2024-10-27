import { schema } from "prosemirror-schema-basic"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { undo, redo, history } from "prosemirror-history"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { boldPlugin } from "./boldPlugin"

const state = EditorState.create({
    schema, plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo, "Mod-Shift-Z": redo }),
        keymap(baseKeymap),
        boldPlugin,
    ],
})

const view = new EditorView(document.querySelector('#editor'), {
    state, attributes: { class: 'editor' }, dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction)
        view.updateState(newState)
    }
})
