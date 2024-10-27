import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { getChangedRanges } from "../utils";
import { Range } from "../types";

export interface DecorationConfig {
    name: string;
    regex: RegExp;
    nodeName: string;
}

export const decorations = (configs: DecorationConfig[]) => {
    return new Plugin({
        state: {
            init(_, { doc }) {
                return DecorationSet.create(doc, []);
            },
            apply(tr, decorationSet, _oldState, newState) {
                let newDecorationSet = decorationSet.map(tr.mapping, tr.doc);

                if (tr.docChanged) {
                    const changedRanges = getChangedRanges(tr);
                    newDecorationSet = applyDecorations(newState.doc, changedRanges, newDecorationSet, configs);
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
};

function applyDecorations(
    doc: ProseMirrorNode,
    changedRanges: Range[],
    existingDecorationSet: DecorationSet,
    configs: DecorationConfig[]
) {
    const newDecorations: Decoration[] = [];

    // Step 1: Remove decorations in the changed ranges
    changedRanges.forEach(({ from, to }) => {
        doc.nodesBetween(from, to, (node, pos) => {
            const decorations = existingDecorationSet.find(pos, pos + node.nodeSize);
            existingDecorationSet = existingDecorationSet.remove(decorations);
        });
    });

    // Step 2: Apply new decorations based on the configuration and regex matches
    changedRanges.forEach(({ from, to }) => {
        doc.nodesBetween(from - 1, to + 1, (node, pos) => {
            if (node.isText && node.text) {
                const text = node.text;
                console.log('text: ', text);
                configs.forEach(({ regex, nodeName }) => {
                    let match;
                    while ((match = regex.exec(text)) !== null) {
                        const start = pos + match.index;
                        const end = start + match[0].length;

                        // Ensure the positions are within the document bounds
                        if (start >= 0 && end <= doc.content.size) {
                            newDecorations.push(Decoration.inline(start, end, { nodeName }));
                        }
                    }
                });

                return false;
            }
            return true;
        });
    });

    return existingDecorationSet.add(doc, newDecorations);
}
