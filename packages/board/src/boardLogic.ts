import type { RealmMap, Tile } from './boardTypes';

export const mapExists = (maps: RealmMap[], mapName: string): boolean =>
    maps.some((map) => map.name === mapName);

export const addMap = (maps: RealmMap[], mapName: string): RealmMap[] => [
    ...maps,
    { name: mapName, tiles: [] },
];

export const updateSelectedMapTiles = (
    maps: RealmMap[],
    selectedMapName: string | undefined,
    tiles: Tile[],
): RealmMap[] => {
    if (!selectedMapName) return maps;

    const index = maps.findIndex((map) => map.name === selectedMapName);
    if (index === -1) return maps;
    if (maps[index].tiles === tiles) return maps;

    const next = maps.slice();
    next[index] = { ...next[index], tiles };
    return next;
};

export const getMapByName = (maps: RealmMap[], name: string): RealmMap | undefined =>
    maps.find((map) => map.name === name);

export const getMapTiles = (map: RealmMap | undefined): Tile[] => map?.tiles ?? [];
