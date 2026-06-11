import type { Map, Tile } from './boardTypes';

export const mapExists = (maps: Map[], mapName: string): boolean =>
    maps.some((map) => map.name === mapName);

export const addMap = (maps: Map[], mapName: string): Map[] => [
    ...maps,
    { name: mapName, tiles: [] },
];

export const updateSelectedMapTiles = (
    maps: Map[],
    selectedMapName: string | undefined,
    tiles: Tile[],
): Map[] =>
    selectedMapName
        ? maps.map((map) => (map.name === selectedMapName ? { ...map, tiles } : map))
        : maps;

export const getMapByName = (maps: Map[], name: string): Map | undefined =>
    maps.find((map) => map.name === name);

export const getMapTiles = (map: Map | undefined): Tile[] => map?.tiles ?? [];

export const createTutorialMap = (theme: string): Map => {
    const plank = new Image();
    plank.src = `/tiles/floor/${theme}/plank.svg`;
    const grass = new Image();
    grass.src = `/tiles/floor/${theme}/grass.svg`;

    const tiles: Tile[] = [];
    const addTile = (x: number, y: number, image: HTMLImageElement | null | undefined) => {
        if (image) tiles.push({ x, y, tileName: image });
    };

    // Simple tutorial layout: floor patch, border, and sample path.
    for (let x = 0; x < 5; x += 1) {
        for (let y = 0; y < 3; y += 1) {
            addTile(x * 100, y * 100, grass);
        }
    }

    addTile(0, 300, grass);
    addTile(100, 300, plank);
    addTile(200, 300, plank);
    addTile(300, 300, plank);
    addTile(400, 300, grass);
    addTile(500, 300, grass);

    addTile(200, 0, plank);
    addTile(200, 100, plank);
    addTile(200, 200, plank);

    addTile(400, 100, plank);
    addTile(400, 200, plank);
    addTile(400, 300, plank);

    return {
        name: 'Tutorial',
        tiles,
    };
};
