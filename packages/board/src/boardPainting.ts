import { cellKey } from './boardHistory';
import { GRID_SIZE, GridIndex, Layer, WallVariant, type Coords, type Tile } from './boardTypes';

export const getSnappedPosition = (
    x: number,
    y: number,
    layerOffset: Coords,
    scale: number,
): Coords => {
    const localX = (x - layerOffset.x) / scale;
    const localY = (y - layerOffset.y) / scale;

    // grid coords, not pixels
    return {
        x: Math.floor(localX / GRID_SIZE),
        y: Math.floor(localY / GRID_SIZE),
    };
};

export const buildGridIndex = (tiles: Tile[], layer: Layer = 'floor'): GridIndex => {
    const index: GridIndex = new Map();
    for (const t of tiles) {
        const x = t.x / GRID_SIZE;
        const y = t.y / GRID_SIZE;
        index.set(layerCellKey(layer, x, y, t.variant), t);
    }
    return index;
};

export const layerCellKey = (layer: Layer, x: number, y: number, variant?: WallVariant) =>
    layer === 'wall' ? `${cellKey(x, y)}:${variant ?? 'v'}` : cellKey(x, y);

export const paintCell = (
    paintedCells: Tile[],
    image: HTMLImageElement | null,
    gridX: number,
    gridY: number,
    layer?: Layer,
    variant?: WallVariant,
): Tile[] => {
    const px = gridX * GRID_SIZE;
    const py = gridY * GRID_SIZE;
    const tile: Tile = { x: px, y: py, tileName: image, layer, variant };

    const sameSlot = (c: Tile) =>
        c.x === px && c.y === py && (layer !== 'wall' || c.variant === variant);

    const exists = paintedCells.some(
        (c) => sameSlot(c) && c.tileName === image && c.variant === variant,
    );
    if (exists) return paintedCells;

    const taken = paintedCells.some(sameSlot);
    if (!taken) return [...paintedCells, tile];

    return paintedCells.map((c) => (sameSlot(c) ? tile : c));
};

export const eraseCell = (
    paintedCells: Tile[],
    gridX: number,
    gridY: number,
    layer?: Layer,
    variant?: WallVariant,
): Tile[] => {
    const px = gridX * GRID_SIZE;
    const py = gridY * GRID_SIZE;
    return paintedCells.filter(
        (c) => !(c.x === px && c.y === py && (layer !== 'wall' || c.variant === variant)),
    );
};

export const getTileAtGrid = (index: GridIndex, gridX: number, gridY: number): Tile | undefined =>
    index.get(cellKey(gridX, gridY));
