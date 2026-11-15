export type RealmMap = {
    tiles: Tile[];
    name: string;
};

export type Coords = {
    x: number;
    y: number;
};

export type HistoryEntry = { deltas: TileDelta[] };

export const GRID_SIZE = 200;

export type Layer = 'floor' | 'wall' | 'decor' | 'trigger';

export type TileDelta = {
    x: number;
    y: number;
    layer?: Layer;
    variant?: WallVariant;
    before: Tile | null;
    after: Tile | null;
};

export type GridIndex = Map<string, Tile>;

export type WallVariant = 'v' | 'h';

export type Tile = {
    x: number;
    y: number;
    tileName: HTMLImageElement | null;
    layer?: Layer;
    variant?: WallVariant;
};
