import { buildGridIndex } from './boardPainting';
import { type GridIndex, type HistoryEntry, type Tile } from './boardTypes';

export const cellKey = (x: number, y: number) => `${x},${y}`;

const MAX_HISTORY = 100;

export const pushEntry = (
    undo: HistoryEntry[],
    entry: HistoryEntry,
    cap = MAX_HISTORY,
): HistoryEntry[] => {
    const next = [...undo, entry];
    return next.length > cap ? next.slice(next.length - cap) : next;
};

export const applyEntry = (
    tiles: Tile[],
    entry: HistoryEntry,
    direction: 'undo' | 'redo',
): Tile[] => {
    const index = buildGridIndex(tiles);
    for (const d of entry.deltas) {
        const value = direction === 'undo' ? d.before : d.after;
        if (value) index.set(cellKey(d.x, d.y), value);
        else index.delete(cellKey(d.x, d.y));
    }
    return [...index.values()];
};
export { GridIndex };
