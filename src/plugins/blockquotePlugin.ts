import { Node } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { getChangedRanges } from '../utils';

export const blockquotePluginKey = new PluginKey('blockquote');

// Helper to check if a paragraph starts with '>'
const startsWithQuote = (node: Node) => {
    return node.textContent.startsWith('> ');
};

// Helper to create a blockquote node
const createBlockquote = (content: Node) => {
    return schema.nodes.blockquote.create(null, content);
};

export const blockquotePlugin = new Plugin({
    key: blockquotePluginKey,
    appendTransaction: (transactions, _oldState, newState) => {
        // Only process if there were actual changes
        if (!transactions.some((tr) => tr.docChanged)) return null;

        const tr = newState.tr;

        const isInsideBlockquote = (pos: number) => {
            const $pos = newState.doc.resolve(pos);
            return $pos.depth > 0 && $pos.parent.type === schema.nodes.blockquote;
        };

        // Process each node in the document
        let hasChanges = false;

        const changedRanges = getChangedRanges(transactions[transactions.length - 1]);

        const { from: originalFrom } = newState.selection;

        console.log('changedRanges: ', changedRanges);

        // Process each changed range
        changedRanges.forEach(({ from, to }) => {
            newState.doc.nodesBetween(
                Math.max(from - 1, 0),
                Math.min(to + 1, newState.doc.content.size),
                (node, pos) => {
                    if (node.type === schema.nodes.paragraph && startsWithQuote(node) && !isInsideBlockquote(pos)) {
                        console.log('node: ', node.textContent);
                        const blockquote = createBlockquote(node);

                        tr.replaceWith(pos, pos + node.nodeSize, blockquote);
                        hasChanges = true;
                        tr.setSelection(TextSelection.create(tr.doc, originalFrom + 1));
                    } else if (node.type === schema.nodes.blockquote && !startsWithQuote(node)) {
                        console.log('Removing blockquote: ', node.textContent);
                        tr.replaceWith(pos, pos + node.nodeSize, node.content);
                        hasChanges = true;
                        tr.setSelection(TextSelection.create(tr.doc, originalFrom - 1));
                    }
                },
            );
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return hasChanges ? tr : null;
    },
});
