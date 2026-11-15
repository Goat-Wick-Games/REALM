import { GRID_SIZE, TileDelta, type HistoryEntry, type Layer, type Tile } from './boardTypes';
import { applyEntry } from './boardHistory';

export const LAYER_ORDER: Layer[] = ['floor', 'wall', 'decor', 'trigger'];

export const flattenLayers = (layers: Record<Layer, Tile[]>): Tile[] =>
    LAYER_ORDER.flatMap((layer) => layers[layer]);

export const splitLayers = (tiles: Tile[]): Record<Layer, Tile[]> => {
    const out: Record<Layer, Tile[]> = { floor: [], wall: [], decor: [], trigger: [] };
    for (const tile of tiles) out[tile.layer ?? 'floor'].push(tile);
    return out;
};

const matches = (c: Tile, d: TileDelta) =>
    c.x === d.x * GRID_SIZE &&
    c.y === d.y * GRID_SIZE &&
    (d.layer !== 'wall' || c.variant === d.variant);

export const applyEntryToLayers = (
    layers: Record<Layer, Tile[]>,
    entry: HistoryEntry,
    direction: 'undo' | 'redo',
): Record<Layer, Tile[]> => {
    const next = { ...layers };

    for (const delta of entry.deltas) {
        const layer = delta.layer ?? 'floor';
        const current = next[layer] ?? [];
        const target = direction === 'undo' ? delta.before : delta.after;

        const without = current.filter((c) => !matches(c, delta));
        next[layer] = target ? [...without, target] : without;
    }

    return next;
};
