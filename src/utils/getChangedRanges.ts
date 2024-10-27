import { Transaction } from "prosemirror-state";
import { Range } from "../types";

export function getChangedRanges(tr: Transaction) {
    const ranges: Range[] = [];

    tr.mapping.maps.forEach((stepMap, index) => {
        stepMap.forEach((from, to) => {
            const newStart = tr.mapping.slice(index).map(from, -1)
            const newEnd = tr.mapping.slice(index).map(to)
            ranges.push({ from: newStart, to: newEnd });
        });
    });

    return ranges;
}