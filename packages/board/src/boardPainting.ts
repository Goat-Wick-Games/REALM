import type { Coords, Tile } from './boardTypes';
import { GRID_SIZE } from './boardTypes';

export const getGridPosition = (
    x: number,
    y: number,
    layerOffset: Coords,
    scale: number,
): Coords => {
    const localX = (x - layerOffset.x) / scale;
    const localY = (y - layerOffset.y) / scale;

    const gridX = Math.floor(localX / GRID_SIZE) * GRID_SIZE;
    const gridY = Math.floor(localY / GRID_SIZE) * GRID_SIZE;

    return { x: gridX, y: gridY };
};

export const paintCell = (
    paintedCells: Tile[],
    image: HTMLImageElement | null | undefined,
    gridX: number,
    gridY: number,
): Tile[] => {
    const exists = paintedCells.some((c) => c.x === gridX && c.y === gridY && c.tileName === image);

    if (exists) {
        return paintedCells;
    }

    const taken = paintedCells.some((c) => c.x === gridX && c.y === gridY);
    if (!taken) {
        return [...paintedCells, { x: gridX, y: gridY, tileName: image }];
    }

    return paintedCells.map((c) =>
        c.x === gridX && c.y === gridY ? { x: gridX, y: gridY, tileName: image } : c,
    );
};

export const eraseCell = (paintedCells: Tile[], gridX: number, gridY: number): Tile[] =>
    paintedCells.filter((c) => !(c.x === gridX && c.y === gridY));

export const getTileAtGrid = (
    paintedCells: Tile[],
    gridX: number,
    gridY: number,
): Tile | undefined => paintedCells.find((c) => c.x === gridX && c.y === gridY);
