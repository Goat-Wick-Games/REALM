export type Tile = {
    x: number;
    y: number;
    tileName: HTMLImageElement | null | undefined;
};

export type Map = {
    tiles: Tile[];
    name: string;
};

export type Coords = {
    x: number;
    y: number;
};

export type HistoryState = Tile[];

export const GRID_SIZE = 200;
