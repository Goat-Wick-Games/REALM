import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import './GameScreen.css';
import { useTheme } from '../context/ThemeContext';
import MapCreatorPopup from '../components/MapCreatorPopup';
import { toast } from 'react-toastify';
import type { Coords, HistoryState, Map, Tile } from '@realm/board';
import {
    GRID_SIZE,
    addMap,
    createTutorialMap,
    eraseCell as eraseCellUtil,
    getGridPosition,
    getRedoState,
    getTileAtGrid,
    getUndoState,
    paintCell as paintCellUtil,
    mapExists,
    panLayer,
    pushHistoryState,
    updateSelectedMapTiles,
    zoomAt,
} from '@realm/board';

type GameScreenProps = { onBack: () => void; editing: boolean };

const GameScreen: React.FC<GameScreenProps> = (props) => {
    const { onBack, editing } = props;
    const { theme } = useTheme();
    const planks = useRef<HTMLImageElement>(null);
    const grass = useRef<HTMLImageElement>(null);

    const tutorialMap = React.useMemo(() => createTutorialMap(theme), [theme]);
    const [maps, setMaps] = useState<Map[]>([tutorialMap]);
    const [selectedMap, setSelectedMap] = useState<Map>(tutorialMap);
    const [editMode, setEditMode] = useState(editing ?? false);
    const [layerOffset, setLayerOffset] = useState<Coords>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [mapCreatorPopup, setMapCreatorPopup] = useState<boolean>(false);
    const [lastPos, setLastPos] = useState<Coords>({ x: 0, y: 0 });
    const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
    const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
    const [mapHistory, setMapHistory] = useState<
        Record<string, { undo: HistoryState[]; redo: HistoryState[] }>
    >({});
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [isErasing, setIsErasing] = useState<boolean>(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState<boolean>(false);
    const [image, setImage] = useState<HTMLImageElement | null>();
    const [paintedCells, setPaintedCells] = useState<Tile[]>(tutorialMap.tiles);

    const paintedCellsRef = useRef<Tile[]>(paintedCells);
    const undoRef = useRef<HistoryState[]>(undoStack);
    const redoRef = useRef<HistoryState[]>(redoStack);

    useEffect(() => {
        if (!selectedMap) return;

        setMaps((prev) => updateSelectedMapTiles(prev, selectedMap.name, paintedCells));
        setSelectedMap((prev) => (prev ? { ...prev, tiles: paintedCells } : prev));
    }, [paintedCells, selectedMap?.name]);

    const saveCurrentMapHistory = () => {
        if (!selectedMap) return;
        setMapHistory((prev) => ({
            ...prev,
            [selectedMap.name]: { undo: undoStack, redo: redoStack },
        }));
    };

    const loadMapHistory = (mapName: string) => {
        const history = mapHistory[mapName] ?? { undo: [], redo: [] };
        setUndoStack(history.undo);
        setRedoStack(history.redo);
    };

    useEffect(() => {
        undoRef.current = undoStack;
    }, [undoStack]);

    useEffect(() => {
        redoRef.current = redoStack;
    }, [redoStack]);

    useEffect(() => {
        paintedCellsRef.current = paintedCells;
    }, [paintedCells]);

    useEffect(() => {
        const prevent = (e: MouseEvent) => e.preventDefault();
        window.addEventListener('contextmenu', prevent);
        return () => window.removeEventListener('contextmenu', prevent);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setIsCtrlPressed(e.ctrlKey);

            if (!e.ctrlKey) return;

            const key = e.key.toLowerCase();

            if (key === 'z') {
                e.preventDefault();
                undo();
            }

            if (key === 'y') {
                e.preventDefault();
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
        const state = getUndoState(undoRef.current, paintedCellsRef.current, redoRef.current);
        if (!state) return;

        undoRef.current = state.newUndo;
        redoRef.current = state.newRedo;

        setUndoStack(state.newUndo);
        setRedoStack(state.newRedo);
        setPaintedCells(state.previous);
    };

    const redo = () => {
        const state = getRedoState(redoRef.current, paintedCellsRef.current, undoRef.current);
        if (!state) return;

        undoRef.current = state.newUndo;
        redoRef.current = state.newRedo;

        setUndoStack(state.newUndo);
        setRedoStack(state.newRedo);
        setPaintedCells(state.previous);
    };

    // Camera panning with middle mouse
    const handleMouseDown = (e: Konva.KonvaEventObject<WheelEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition()!;

        // middle mouse = pan
        if (e.evt.button === 1) {
            setIsPanning(true);
            setLastPos({ x: pointer.x, y: pointer.y });
            return;
        }

        if (!editMode) return;

        // CTRL+LEFT CLICK → copy tile under cursor
        if (e.evt.button === 0 && e.evt.ctrlKey) {
            const { x: gridX, y: gridY } = getGridPosition(
                pointer.x,
                pointer.y,
                layerOffset,
                scale,
            );
            const tile = getTileAtGrid(paintedCells, gridX, gridY);
            if (tile?.tileName) {
                setImage(tile.tileName);
            }
            return;
        }

        // LEFT CLICK → paint
        if (e.evt.button === 0) {
            pushHistory();
            setIsPainting(true);
            paintCell(pointer.x, pointer.y);
        }

        // RIGHT CLICK → erase
        if (e.evt.button === 2) {
            pushHistory();
            setIsErasing(true);
            eraseCell(pointer.x, pointer.y);
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsErasing(false);
        setIsPainting(false);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<WheelEvent>) => {
        if (!isErasing && !isPanning && !isPainting) return;
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition()!;
        if (isPanning) {
            setLayerOffset((prev) => panLayer(prev, lastPos, { x: pointer.x, y: pointer.y }));
            setLastPos({ x: pointer.x, y: pointer.y });
        } else if (isPainting) {
            paintCell(pointer.x, pointer.y);
        } else if (isErasing) {
            eraseCell(pointer.x, pointer.y);
        }
    };

    const pushHistory = () => {
        const current = paintedCellsRef.current;

        setUndoStack((prev) => pushHistoryState(prev, current));
        setRedoStack([]);
    };

    const handleMapCreated = (mapName: string) => {
        if (mapExists(maps, mapName)) {
            toast.error('A map with that name already exists.');
            return;
        }

        setMaps((prev) => addMap(prev, mapName));
    };

    // Paint a cell at the pointer position (snapped to grid)
    const paintCell = (x: number, y: number) => {
        const { x: gridX, y: gridY } = getGridPosition(x, y, layerOffset, scale);
        setPaintedCells((prev) => paintCellUtil(prev, image, gridX, gridY));
    };

    const eraseCell = (x: number, y: number) => {
        const { x: gridX, y: gridY } = getGridPosition(x, y, layerOffset, scale);
        setPaintedCells((prev) => eraseCellUtil(prev, gridX, gridY));
    };

    // Optional zoom
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;

        const scaleBy = 1.1;
        const pointer = stage.getPointerPosition()!;
        const direction = e.evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
        const result = zoomAt({ x: pointer.x, y: pointer.y }, layerOffset, scale, direction);

        setScale(result.scale);
        setLayerOffset(result.layerOffset);
    };

    return (
        <main className={`GameScreen`}>
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
                                        saveCurrentMapHistory();
                                        setSelectedMap(map);
                                        setPaintedCells(map.tiles);
                                        loadMapHistory(map.name);
                                    }}
                                >
                                    {map.name}
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
                                <div className="Floor">
                                    <h3>Floor</h3>
                                    <section>
                                        <div
                                            className={`Planks ${image === planks.current ? 'Selected' : ''}`}
                                            onClick={() => setImage(planks.current)}
                                        >
                                            <img
                                                ref={planks}
                                                src={`/tiles/floor/${theme}/plank.svg`}
                                                alt="Planks"
                                            />
                                        </div>
                                        <div
                                            className={`Grass ${image === grass.current ? 'Selected' : ''}`}
                                            onClick={() => setImage(grass.current)}
                                        >
                                            <img
                                                ref={grass}
                                                src={`/tiles/floor/${theme}/grass.svg`}
                                                alt="Grass"
                                            />
                                        </div>
                                    </section>
                                </div>
                                <div className="Walls">
                                    <h3>Walls</h3>
                                </div>
                                <div className="Decor">
                                    <h3>Decor</h3>
                                </div>
                                <div className="Triggers">
                                    <h3>Triggers</h3>
                                </div>
                            </div>
                        ) : (
                            <>Effects</>
                        )}
                    </div>
                </aside>
            </div>

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
                {/* Objects & grid Layer */}
                <Layer x={layerOffset.x} y={layerOffset.y} scaleX={scale} scaleY={scale}>
                    {/* Painted cells */}
                    {selectedMap?.tiles.map((cell, i) => (
                        <Rect
                            key={i}
                            x={cell.x - 1}
                            y={cell.y - 1}
                            width={GRID_SIZE + 2}
                            height={GRID_SIZE + 2}
                            fillPatternImage={cell.tileName ?? undefined}
                        />
                    ))}
                </Layer>
            </Stage>
        </main>
    );
};

export default GameScreen;
