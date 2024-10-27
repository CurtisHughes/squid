import { Plugin, Transaction } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProseMirrorNode } from "prosemirror-model";

interface Range { from: number; to: number; }

export const boldPlugin = new Plugin({
    state: {
        init(_, { doc }) {
            return DecorationSet.create(doc, []);
        },
        apply(tr, decorationSet, _oldState, newState) {
            let newDecorationSet = decorationSet.map(tr.mapping, tr.doc);

            if (tr.docChanged) {
                const changedRanges = getChangedRanges(tr);
                newDecorationSet = applyBoldToText(newState.doc, changedRanges, newDecorationSet);
            }

            return newDecorationSet;
        }
    },
    props: {
        decorations(state) {
            return this.getState(state);
        }
    }
});

// Function to get the ranges affected by the transaction
function getChangedRanges(tr: Transaction) {
    const ranges: Range[] = [];

    tr.mapping.maps.forEach((stepMap, index) => {
        stepMap.forEach((from, to) => {
            const newStart = tr.mapping.slice(index).map(from, -1)
            const newEnd = tr.mapping.slice(index).map(to)

            ranges.push({ from: newStart, to: newEnd });
        })
    })

    return ranges;
}

function applyBoldToText(doc: ProseMirrorNode, changedRanges: Range[], existingDecorationSet: DecorationSet) {
    const newDecorations: Decoration[] = [];

    // Step 1: Remove decorations in the changed ranges
    changedRanges.forEach(({ from, to }) => {
        doc.nodesBetween(from, to, (node, pos) => {
            const decorations = existingDecorationSet.find(pos, pos + node.nodeSize);
            existingDecorationSet = existingDecorationSet.remove(decorations);
        });
    });


    // Step 2: Reapply bold decorations based on the new content of the document
    changedRanges.forEach(({ from, to }) => {
        doc.nodesBetween(from - 1, to, (node, pos) => {
            if (node.isText && node.text) {
                const text = node.text;
                let match;

                console.log('text: ', text);
                // Regex to match **bold** text
                const regex = /\*\*(.+?)\*\*/g;

                // Apply new bold decorations where valid ** pairs are found
                while ((match = regex.exec(text)) !== null) {
                    const start = pos + match.index;
                    const end = start + match[0].length;

                    // Ensure the positions are within the document bounds
                    if (start >= 0 && end <= doc.content.size) {
                        newDecorations.push(Decoration.inline(start, end, { nodeName: "strong" }));
                    }
                }

                return false;
            }

            return true;
        });
    });

    return existingDecorationSet.add(doc, newDecorations);
}
