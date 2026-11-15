import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Shape } from 'react-konva';
import Konva from 'konva';
import './RealmEditScreen.css';
import { useTheme } from '../context/ThemeContext';
import MapCreatorPopup from '../components/MapCreatorPopup';
import { toast } from 'react-toastify';
import type {
    Coords,
    GridIndex,
    HistoryEntry,
    RealmMap,
    Tile,
    TileDelta,
    WallVariant,
} from '@realm/board';
import {
    GRID_SIZE,
    LAYER_ORDER,
    addMap,
    applyEntryToLayers,
    buildGridIndex,
    eraseCell as eraseCellUtil,
    flattenLayers,
    getSnappedPosition,
    layerCellKey,
    mapExists,
    paintCell as paintCellUtil,
    panLayer,
    pushEntry,
    splitLayers,
    updateSelectedMapTiles,
    zoomAt,
} from '@realm/board';

type RealmEditScreenProps = { onBack: () => void; editing: boolean };

type Tab = 'floor' | 'wall' | 'decor' | 'trigger';

const TABS: { id: Tab; label: string }[] = [
    { id: 'floor', label: 'Floor' },
    { id: 'wall', label: 'Walls' },
    { id: 'decor', label: 'Decor' },
    { id: 'trigger', label: 'Triggers' },
];

type TileButtonProps = {
    className: string;
    isSelected: boolean;
    onClick: () => void;
    imgRef?: React.RefObject<HTMLImageElement | null>;
    src: string;
    alt: string;
};

const TileButton: React.FC<TileButtonProps> = ({
    className,
    isSelected,
    onClick,
    imgRef,
    src,
    alt,
}) => (
    <div className={`${className} ${isSelected ? 'Selected' : ''}`} onClick={onClick}>
        <img ref={imgRef} src={src} alt={alt} crossOrigin="anonymous" />
    </div>
);

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

// --- Wall metrics -----------------------------------------------------------
// A vertical wall snaps to the LEFT edge of its cell (50 wide).
// A horizontal wall snaps to the BOTTOM edge (200 wide, 100 tall).
// Both may occupy the same cell, which forms an L.
const WALL_THICKNESS = GRID_SIZE / 4; // 50  — vertical wall width
const WALL_FACE = GRID_SIZE / 2; // 100 — horizontal wall height
const H_CAP = GRID_SIZE / 4; // 50  — horizontal theme cap
const V_FACE = GRID_SIZE / 2; // 100 — vertical textured face
const V_BODY = GRID_SIZE; // 200 — vertical theme body
const V_HEAD = V_FACE + V_BODY + GRID_SIZE / 4; // 350 — full vertical strip

const FLOOR_TILES = [
    { className: 'Planks', name: 'plank', alt: 'Planks' },
    { className: 'Grass', name: 'grass', alt: 'Grass' },
    { className: 'Mud', name: 'mud', alt: 'Mud' },
    { className: 'Brick', name: 'brick', alt: 'Brick' },
    { className: 'Stone', name: 'stone', alt: 'Stone' },
    { className: 'Water', name: 'water', alt: 'Water' },
];

const WALL_TILES = [
    { className: 'Brick', name: 'brick-h', alt: 'Brick Wall h', variant: 'h' as const },
    { className: 'Brick', name: 'brick-v', alt: 'Brick Wall v', variant: 'v' as const },
];

const RealmEditScreen: React.FC<RealmEditScreenProps> = (props) => {
    const { onBack, editing } = props;
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('floor');
    const [hoverCell, setHoverCell] = useState<Coords | null>(null);

    const tutorialMap = React.useMemo(() => createTutorialMap(theme), [theme]);
    const [maps, setMaps] = useState<RealmMap[]>([tutorialMap]);
    const [selectedMap, setSelectedMap] = useState<RealmMap | null>(tutorialMap);
    const [editMode, setEditMode] = useState(editing ?? false);
    const [layerOffset, setLayerOffset] = useState<Coords>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [mapCreatorPopup, setMapCreatorPopup] = useState<boolean>(false);
    const [lastPos, setLastPos] = useState<Coords>({ x: 0, y: 0 });
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [isErasing, setIsErasing] = useState<boolean>(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState<boolean>(false);
    const [variant, setVariant] = useState<WallVariant>('v');
    const [image, setImage] = useState<HTMLImageElement | null>();
    const [paintedCells, setPaintedCells] = useState<Record<Tab, Tile[]>>(() => ({
        floor: tutorialMap.tiles,
        wall: [],
        decor: [],
        trigger: [],
    }));
    const [tileCache, setTileCache] = useState<Record<string, HTMLImageElement>>({});
    const [tilesLoaded, setTilesLoaded] = useState<boolean>(false);

    const mapHistoryRef = useRef<Record<string, { undo: HistoryEntry[]; redo: HistoryEntry[] }>>(
        {},
    );
    const paintedCellsRef = useRef<Record<Tab, Tile[]>>(paintedCells);
    const undoRef = useRef<HistoryEntry[]>([]);
    const redoRef = useRef<HistoryEntry[]>([]);
    const pendingDeltasRef = useRef<TileDelta[]>([]);
    const lastPaintedRef = useRef<string>('');
    const lastErasedRef = useRef<string>('');
    const gridIndexRef = useRef<Record<Tab, GridIndex>>({
        floor: buildGridIndex(tutorialMap.tiles, 'floor'),
        wall: buildGridIndex([]),
        decor: buildGridIndex([]),
        trigger: buildGridIndex([]),
    });
    const activeTabRef = useRef<Tab>(activeTab);
    const variantRef = useRef<WallVariant>(variant);
    const imageRef = useRef<HTMLImageElement | null | undefined>(image);
    const tileCacheRef = useRef(tileCache);

    useEffect(() => {
        tileCacheRef.current = tileCache;
    }, [tileCache]);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);
    useEffect(() => {
        variantRef.current = variant;
    }, [variant]);
    useEffect(() => {
        imageRef.current = image;
    }, [image]);

    const applyTiles = (next: Record<Tab, Tile[]>) => {
        paintedCellsRef.current = next;
        gridIndexRef.current = {
            floor: buildGridIndex(next.floor, 'floor'),
            wall: buildGridIndex(next.wall, 'wall'),
            decor: buildGridIndex(next.decor, 'decor'),
            trigger: buildGridIndex(next.trigger, 'trigger'),
        };

        setPaintedCells(next);
    };

    const updateLayer = (layer: Tab, next: Tile[]) => {
        applyTiles({ ...paintedCellsRef.current, [layer]: next });
    };

    const swapVariant = (img: HTMLImageElement, next: WallVariant) => {
        const path = (img as HTMLImageElement & { srcPath?: string }).srcPath ?? img.src;
        const src = path.replace(/-[vh]\.svg$/, `-${next}.svg`);
        return tileCache[src] ?? img;
    };

    useEffect(() => {
        if (!selectedMap) return;
        const flat = flattenLayers(paintedCells);
        setMaps((prev) => updateSelectedMapTiles(prev, selectedMap.name, flat));
        setSelectedMap((prev) => (prev ? { ...prev, tiles: flat } : prev));
    }, [paintedCells, selectedMap?.name]);

    useEffect(() => {
        if (maps.length === 0) {
            setEditMode(false);
        }
    }, [maps]);

    function createTutorialMap(theme: string): RealmMap {
        const createWorkingTile = (name: string) => {
            const tile = new Image();
            tile.crossOrigin = 'anonymous';
            tile.src = `/tiles/floor/${theme}/${name}.svg`;
            return tile;
        };

        const plank = createWorkingTile('plank');
        const grass = createWorkingTile('grass');

        const tileSize = GRID_SIZE;

        const tiles: Tile[] = [];
        const addTile = (x: number, y: number, image: HTMLImageElement | null | undefined) => {
            if (image) tiles.push({ x: x * tileSize, y: y * tileSize, tileName: image });
        };

        for (let x = 0; x < 5; x += 1) {
            for (let y = 0; y < 3; y += 1) {
                addTile(x, y, grass);
            }
        }

        for (let x = 0; x < 5; x += 1) {
            addTile(x, 0, plank);
            addTile(x, 2, plank);
        }

        for (let y = 0; y < 3; y += 1) {
            addTile(0, y, plank);
            addTile(4, y, plank);
        }

        addTile(1, 1, plank);
        addTile(2, 1, plank);
        addTile(3, 1, plank);

        return {
            name: 'Tutorial',
            tiles,
        };
    }

    const saveCurrentMapHistory = () => {
        if (!selectedMap) return;
        mapHistoryRef.current = {
            ...mapHistoryRef.current,
            [selectedMap.name]: { undo: undoRef.current, redo: redoRef.current },
        };
    };

    const loadMapHistory = (mapName: string) => {
        const history = mapHistoryRef.current[mapName] ?? { undo: [], redo: [] };
        undoRef.current = history.undo;
        redoRef.current = history.redo;
    };

    const deleteMap = (mapName: string) => {
        if (!mapExists(maps, mapName)) return;

        const updated = maps.filter((map) => map.name !== mapName);
        setMaps(updated);

        const { [mapName]: _removed, ...rest } = mapHistoryRef.current;
        mapHistoryRef.current = rest;

        if (mapName === selectedMap?.name) {
            setNewMap(updated.length > 0 ? updated[0].name : null, updated);
        }
    };

    const setNewMap = (mapName: string | null, nextMaps: RealmMap[] = maps) => {
        if (!mapName) {
            setSelectedMap(null);
            applyTiles({ floor: [], wall: [], decor: [], trigger: [] });
            return;
        }

        const map = nextMaps.find((m) => m.name === mapName);
        if (!map) return;

        if (selectedMap && selectedMap.name !== mapName) {
            saveCurrentMapHistory();
        }

        setSelectedMap(map);
        applyTiles(splitLayers(map.tiles));
        loadMapHistory(map.name);
    };

    useEffect(() => {
        paintedCellsRef.current = paintedCells;
    }, [paintedCells]);

    useEffect(() => {
        const cleanups: Array<() => void> = [];

        Object.values(paintedCells)
            .flat()
            .forEach((cell) => {
                const img = cell.tileName as HTMLImageElement | null | undefined;
                if (!img) return;
                if (img.complete && img.naturalWidth !== 0) return;

                const onLoad = () => {
                    setPaintedCells((prev) => ({ ...prev }));
                };

                img.addEventListener('load', onLoad);
                cleanups.push(() => img.removeEventListener('load', onLoad));
            });

        return () => {
            cleanups.forEach((fn) => fn());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tilesLoaded]);

    useEffect(() => {
        setTilesLoaded(false);

        const floorNames = FLOOR_TILES.map((t) => t.name);
        const wallNames = WALL_TILES.map((t) => t.name);

        const sources = [
            ...floorNames.map((name) => `/tiles/floor/${theme}/${name}.svg`),
            ...wallNames.map((name) => `/tiles/wall/${theme}/${name}.svg`),
        ];

        let remaining = sources.length;
        const markTileLoaded = () => {
            remaining -= 1;
            if (remaining === 0) setTilesLoaded(true);
        };

        sources.forEach((src) => {
            if (tileCache[src]) {
                markTileLoaded();
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = src;
            img.onload = () => {
                (img as HTMLImageElement & { srcPath?: string }).srcPath = src;
                setTileCache((prev) => ({ ...prev, [src]: img }));
                markTileLoaded();
            };

            img.onerror = () => {
                setTileCache((prev) => ({ ...prev, [src]: img }));
                markTileLoaded();
            };
        });
    }, [theme]);

    useEffect(() => {
        const prevent = (e: MouseEvent) => e.preventDefault();
        window.addEventListener('contextmenu', prevent);
        return () => window.removeEventListener('contextmenu', prevent);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setIsCtrlPressed(e.ctrlKey);

            const key = e.key.toLowerCase();

            if (key === 'r' && activeTabRef.current === 'wall') {
                e.preventDefault();
                const next: WallVariant = variantRef.current === 'v' ? 'h' : 'v';
                const nextImg = imageRef.current
                    ? swapVariant(imageRef.current, next)
                    : imageRef.current;
                setVariant(next);
                setImage(nextImg);
                return;
            }

            if (!e.ctrlKey) return;

            if (key === 'z') {
                e.preventDefault();
                if (!(undoRef.current.length > 0)) return;
                undo();
            }

            if (key === 'y') {
                e.preventDefault();
                if (!(redoRef.current.length > 0)) return;
                redo();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.ctrlKey) {
                setIsCtrlPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const undo = () => {
        const entry = undoRef.current[undoRef.current.length - 1];
        if (!entry) return;

        undoRef.current = undoRef.current.slice(0, -1);
        redoRef.current = [...redoRef.current, entry];

        applyTiles(applyEntryToLayers(paintedCellsRef.current, entry, 'undo'));
    };

    const redo = () => {
        const entry = redoRef.current[redoRef.current.length - 1];
        if (!entry) return;

        redoRef.current = redoRef.current.slice(0, -1);
        undoRef.current = [...undoRef.current, entry];

        applyTiles(applyEntryToLayers(paintedCellsRef.current, entry, 'redo'));
    };

    const commitStroke = () => {
        if (pendingDeltasRef.current.length === 0) return;

        const entry: HistoryEntry = { deltas: pendingDeltasRef.current };
        undoRef.current = pushEntry(undoRef.current, entry);
        redoRef.current = [];
        pendingDeltasRef.current = [];
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition()!;

        if (e.evt.button === 1) {
            setIsPanning(true);
            setLastPos({ x: pointer.x, y: pointer.y });
            return;
        }

        if (!editMode) return;

        pendingDeltasRef.current = [];

        if (e.evt.button === 0 && e.evt.ctrlKey) {
            const { x: gridX, y: gridY } = getSnappedPosition(
                pointer.x,
                pointer.y,
                layerOffset,
                scale,
            );
            const tile =
                gridIndexRef.current[activeTab].get(
                    layerCellKey(activeTab, gridX, gridY, variant),
                ) ?? null;
            if (tile?.tileName) {
                setImage(tile.tileName);
                if (tile.variant) setVariant(tile.variant);
            }
            return;
        }

        if (e.evt.button === 0) {
            setIsPainting(true);
            lastPaintedRef.current = '';
            paintCell(pointer.x, pointer.y);
        }

        if (e.evt.button === 2) {
            setIsErasing(true);
            lastErasedRef.current = '';
            eraseCell(pointer.x, pointer.y);
        }
    };

    const handleMouseUp = () => {
        commitStroke();
        setIsPanning(false);
        setIsErasing(false);
        setIsPainting(false);
        lastPaintedRef.current = '';
        lastErasedRef.current = '';
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition()!;

        if (isPanning) {
            setLayerOffset((prev) => panLayer(prev, lastPos, { x: pointer.x, y: pointer.y }));
            setLastPos({ x: pointer.x, y: pointer.y });
            return;
        }

        if (isPainting) {
            paintCell(pointer.x, pointer.y);
            return;
        }

        if (isErasing) {
            eraseCell(pointer.x, pointer.y);
            return;
        }

        if (editMode && image) {
            const cell = getSnappedPosition(pointer.x, pointer.y, layerOffset, scale);
            setHoverCell((prev) => (prev && prev.x === cell.x && prev.y === cell.y ? prev : cell));
        }
    };

    const handleMapCreated = (mapName: string) => {
        if (mapExists(maps, mapName)) {
            toast.error('A map with that name already exists.');
            return;
        }

        setMaps((prev) => addMap(prev, mapName));
    };

    const paintCell = (x: number, y: number) => {
        if (!image) return;

        const { x: gridX, y: gridY } = getSnappedPosition(x, y, layerOffset, scale);
        const layer = activeTab;
        const key = layerCellKey(layer, gridX, gridY, variant);
        if (lastPaintedRef.current === key) return;
        lastPaintedRef.current = key;

        const existing = gridIndexRef.current[layer].get(key) ?? null;
        if (existing?.tileName === image && existing?.variant === variant) return;

        pendingDeltasRef.current.push({
            x: gridX,
            y: gridY,
            layer,
            variant: layer === 'wall' ? variant : undefined,
            before: existing,
            after: null,
        });

        const next = paintCellUtil(
            paintedCellsRef.current[layer],
            image,
            gridX,
            gridY,
            layer,
            layer === 'wall' ? variant : undefined,
        );
        const after =
            next.find(
                (c) =>
                    c.x === gridX * GRID_SIZE &&
                    c.y === gridY * GRID_SIZE &&
                    (layer !== 'wall' || c.variant === variant),
            ) ?? null;
        pendingDeltasRef.current[pendingDeltasRef.current.length - 1].after = after;

        updateLayer(layer, next);
    };

    const eraseCell = (x: number, y: number) => {
        const { x: gridX, y: gridY } = getSnappedPosition(x, y, layerOffset, scale);
        const layer = activeTab;
        const key = layerCellKey(layer, gridX, gridY, variant);
        if (lastErasedRef.current === key) return;
        lastErasedRef.current = key;

        const existing = gridIndexRef.current[layer].get(key) ?? null;
        if (!existing) return;

        pendingDeltasRef.current.push({
            x: gridX,
            y: gridY,
            layer,
            variant: layer === 'wall' ? variant : undefined,
            before: existing,
            after: null,
        });

        const next = eraseCellUtil(
            paintedCellsRef.current[layer],
            gridX,
            gridY,
            layer,
            layer === 'wall' ? variant : undefined,
        );
        updateLayer(layer, next);
    };

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition()!;
        const direction = e.evt.deltaY > 0 ? 1 / 1.1 : 1.1;
        const result = zoomAt({ x: pointer.x, y: pointer.y }, layerOffset, scale, direction);
        const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, result.scale));
        if (clamped === scale) return;

        setScale(clamped);
        setLayerOffset(result.layerOffset);
    };

    const renderTileGrid = (tab: Tab) => {
        let tiles: { className: string; name: string; alt: string; variant?: WallVariant }[] = [];

        switch (tab) {
            case 'floor':
                tiles = FLOOR_TILES;
                break;
            case 'wall':
                tiles = WALL_TILES;
                break;
            case 'decor':
                // tiles = DECOR_TILES;
                break;
            case 'trigger':
                // tiles = TRIGGER_TILES;
                break;
        }

        return tiles.map((tile) => {
            const src = `/tiles/${tab}/${theme}/${tile.name}.svg`;
            const tileImage = tileCache[src];
            if (src.split('/').pop()?.includes('-v')) {
                return null;
            } // Hide vertical wall tile from selection, as it is not meant to be selected directly.
            return (
                <TileButton
                    key={tile.name}
                    className={tile.className}
                    isSelected={image === tileImage}
                    onClick={() => {
                        if (!tileImage) return;
                        setImage(tileImage);
                        if (tile.variant) setVariant(tile.variant);
                    }}
                    src={src}
                    alt={tile.alt}
                />
            );
        });
    };

    return (
        <main className={`RealmEditScreen`}>
            {mapCreatorPopup && (
                <MapCreatorPopup
                    closePopup={() => setMapCreatorPopup(false)}
                    mapCreated={handleMapCreated}
                />
            )}
            <img src={`/bg/REALM-${theme}.svg`} alt="Background" />
            <div className="UI">
                <button className="BackBtn" onClick={onBack}>
                    ←
                </button>
                <aside className="Maps Sidebar">
                    <div className="Title">
                        <div className="checkbox-wrapper-8">
                            <input
                                disabled={maps.length === 0}
                                checked={editMode}
                                onChange={(e) => setEditMode(e.target.checked)}
                                className="tgl tgl-skewed"
                                id="cb3-8"
                                type="checkbox"
                            />
                            <label
                                className="tgl-btn Mode"
                                data-tg-off="OFF"
                                data-tg-on="ON"
                                htmlFor="cb3-8"
                            >
                                Editing Mode
                            </label>
                        </div>
                    </div>
                    <div className="MapList">
                        <h2>Maps</h2>
                        <button onClick={() => setMapCreatorPopup(true)}>+</button>
                        {maps.length === 0 ? (
                            <p>No maps yet</p>
                        ) : (
                            maps.map((map, i) => (
                                <div
                                    key={i}
                                    className={`Map ${map.name === selectedMap?.name ? 'SelectedMap' : ''}`}
                                    onClick={() => {
                                        if (map.name === selectedMap?.name) return;
                                        setNewMap(map.name);
                                    }}
                                >
                                    {map.name}
                                    <button
                                        className="DeleteMapBtn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMap(map.name);
                                        }}
                                    >
                                        <img src="/icons/trash.svg" alt="Delete Map" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
                <aside className="Tools Sidebar">
                    <div className="Title">
                        {editMode ? (
                            <div className="Tiles">
                                <h2>Tiles</h2>
                                <div className="Tabs">
                                    {TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            className={`Tab ${activeTab === tab.id ? 'ActiveTab' : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="TabPanel">
                                    {activeTab === 'floor' && (
                                        <section>{renderTileGrid('floor')}</section>
                                    )}
                                    {activeTab === 'wall' && (
                                        <section>{renderTileGrid('wall')}</section>
                                    )}
                                    {activeTab === 'decor' && (
                                        <section>{renderTileGrid('decor')}</section>
                                    )}
                                    {activeTab === 'trigger' && (
                                        <section>{renderTileGrid('trigger')}</section>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>Effects</>
                        )}
                    </div>
                </aside>
            </div>

            {tilesLoaded ? (
                <Stage
                    width={window.innerWidth}
                    height={window.innerHeight}
                    className="Canvas"
                    style={{
                        cursor:
                            isCtrlPressed && editMode
                                ? 'copy'
                                : isPanning
                                  ? 'grabbing'
                                  : editMode
                                    ? isErasing
                                        ? 'crosshair'
                                        : 'cell'
                                    : 'default',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <Layer x={layerOffset.x} y={layerOffset.y} scaleX={scale} scaleY={scale}>
                        <Shape
                            sceneFunc={(ctx, shape) => {
                                // Theme fill for the vertical wall's bottom block.
                                // Read here, inside the closure, so it flips with
                                // the theme; never cache it in a ref.
                                const bodyFill = theme === 'dark' ? '#000' : '#fff';

                                for (const layer of LAYER_ORDER) {
                                    if (layer !== 'wall') {
                                        for (const cell of paintedCells[layer]) {
                                            const img = cell.tileName;
                                            if (!img) continue;
                                            ctx.drawImage(
                                                img,
                                                cell.x,
                                                cell.y,
                                                GRID_SIZE,
                                                GRID_SIZE,
                                            );
                                        }
                                        continue;
                                    }
                                    for (const cell of paintedCells.wall) {
                                        if (cell.variant !== 'h') continue;
                                        const img = cell.tileName;
                                        if (!img) continue;

                                        const y = cell.y + GRID_SIZE - WALL_FACE;

                                        // 100 textured face, flush with the
                                        // cell's bottom edge.
                                        ctx.drawImage(img, cell.x, y, GRID_SIZE, WALL_FACE);

                                        // 50 theme bar directly above it.
                                        ctx.fillStyle = bodyFill;
                                        ctx.fillRect(cell.x, y - H_CAP, GRID_SIZE, H_CAP);
                                    }

                                    for (const cell of paintedCells.wall) {
                                        if (cell.variant !== 'v') continue;
                                        const img = cell.tileName;
                                        if (!img) continue;

                                        const x = cell.x - WALL_THICKNESS / 2;

                                        const belowKey = layerCellKey(
                                            'wall',
                                            cell.x / GRID_SIZE,
                                            cell.y / GRID_SIZE + 1,
                                            'v',
                                        );
                                        const hasBelow =
                                            gridIndexRef.current.wall.get(belowKey)?.variant ===
                                            'v';

                                        // Bottom of the strip = bottom of the cell.
                                        const faceTop = cell.y + GRID_SIZE - V_FACE;

                                        if (hasBelow) {
                                            // No texture: the whole 350 strip
                                            // is theme colour, from the cell's
                                            // bottom edge up.
                                            ctx.fillStyle = bodyFill;
                                            ctx.fillRect(
                                                x,
                                                cell.y + GRID_SIZE - V_HEAD,
                                                WALL_THICKNESS,
                                                V_HEAD,
                                            );
                                        } else {
                                            // 100x50 texture at the bottom.
                                            ctx.drawImage(img, x, faceTop, WALL_THICKNESS, V_FACE);

                                            // Theme body above it, filling the
                                            // rest of the strip.
                                            ctx.fillStyle = bodyFill;
                                            ctx.fillRect(
                                                x,
                                                cell.y + GRID_SIZE - V_HEAD,
                                                WALL_THICKNESS,
                                                V_HEAD - V_FACE,
                                            );
                                        }
                                    }
                                }
                                ctx.fillStrokeShape(shape);
                            }}
                            listening={false}
                        />
                        {hoverCell && image && editMode && (
                            <>
                                {activeTab === 'wall' && variant === 'v' ? (
                                    <>
                                        <Rect
                                            x={hoverCell.x * GRID_SIZE - GRID_SIZE / 8}
                                            y={hoverCell.y * GRID_SIZE + GRID_SIZE - V_FACE}
                                            width={GRID_SIZE / 4}
                                            height={V_FACE}
                                            fillPatternImage={image}
                                            opacity={0.5}
                                            listening={false}
                                        />
                                        <Rect
                                            x={hoverCell.x * GRID_SIZE - GRID_SIZE / 8}
                                            y={hoverCell.y * GRID_SIZE + GRID_SIZE - V_HEAD}
                                            width={GRID_SIZE / 4}
                                            height={V_HEAD - V_FACE}
                                            fill={theme === 'dark' ? '#000' : '#fff'}
                                            opacity={0.5}
                                            listening={false}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Rect
                                            x={hoverCell.x * GRID_SIZE}
                                            y={
                                                activeTab === 'wall' && variant === 'h'
                                                    ? hoverCell.y * GRID_SIZE +
                                                      GRID_SIZE -
                                                      WALL_FACE
                                                    : hoverCell.y * GRID_SIZE
                                            }
                                            width={GRID_SIZE}
                                            height={
                                                activeTab === 'wall' && variant === 'h'
                                                    ? WALL_FACE
                                                    : GRID_SIZE
                                            }
                                            fillPatternImage={image}
                                            opacity={0.5}
                                            listening={false}
                                        />
                                        {activeTab === 'wall' && variant === 'h' && (
                                            <Rect
                                                x={hoverCell.x * GRID_SIZE}
                                                y={
                                                    hoverCell.y * GRID_SIZE +
                                                    GRID_SIZE -
                                                    WALL_FACE -
                                                    H_CAP
                                                }
                                                width={GRID_SIZE}
                                                height={H_CAP}
                                                fill={theme === 'dark' ? '#000' : '#fff'}
                                                opacity={0.5}
                                                listening={false}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Layer>
                </Stage>
            ) : (
                <div
                    className="Canvas Loading"
                    style={{ width: window.innerWidth, height: window.innerHeight }}
                >
                    Loading tiles...
                </div>
            )}
        </main>
    );
};

export default RealmEditScreen;
