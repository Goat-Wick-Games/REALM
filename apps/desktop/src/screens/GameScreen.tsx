import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import './GameScreen.css';
import { useTheme } from '../context/ThemeContext';
import MapCreatorPopup from '../components/MapCreatorPopup';

type GameScreenProps = { onBack: () => void; editing: boolean };

type Tile = { x: number; y: number; tileName: HTMLImageElement | null | undefined };

type Map = {
    id: number;
    tiles: Tile[];
    name: string;
};

type Coords = { x: number; y: number };

type HistoryState = Tile[];

const GRID_SIZE = 100;

const GameScreen: React.FC<GameScreenProps> = (props) => {
    const { onBack, editing } = props;
    const { theme } = useTheme();
    const planks = useRef<HTMLImageElement>(null);
    const grass = useRef<HTMLImageElement>(null);

    const [maps, setMaps] = useState<Map[]>([]);
    const [selectedMap, setSelectedMap] = useState<Map>();
    const [editMode, setEditMode] = useState(editing ?? false);
    const [layerOffset, setLayerOffset] = useState<Coords>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [mapCreatorPopup, setMapCreatorPopup] = useState<boolean>(false);
    const [lastPos, setLastPos] = useState<Coords>({ x: 0, y: 0 });
    const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
    const [, setRedoStack] = useState<HistoryState[]>([]);
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [isErasing, setIsErasing] = useState<boolean>(false);
    const [image, setImage] = useState<HTMLImageElement | null>();
    const [paintedCells, setPaintedCells] = useState<Tile[]>([]);

    const paintedCellsRef = useRef(paintedCells);
    const undoRef = useRef<HistoryState[]>(undoStack);
    const redoRef = useRef<HistoryState[]>([]);

    useEffect(() => {
        paintedCellsRef.current = paintedCells;
        setMaps((prev) =>
            prev.map((map) => (map.id === selectedMap?.id ? { ...map, tiles: paintedCells } : map)),
        );
    }, [paintedCells]);

    useEffect(() => {
        undoRef.current = undoStack;
    }, [undoStack]);

    useEffect(() => {
        const prevent = (e: MouseEvent) => e.preventDefault();
        window.addEventListener('contextmenu', prevent);
        return () => window.removeEventListener('contextmenu', prevent);
    }, []);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
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

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    });

    const undo = () => {
        const undoStack = undoRef.current;
        if (undoStack.length === 0) return;

        const current = paintedCellsRef.current;
        const previous = undoStack[undoStack.length - 1];

        const newUndo = undoStack.slice(0, -1);
        const newRedo = [...redoRef.current, [...current]];

        undoRef.current = newUndo;
        redoRef.current = newRedo;

        setUndoStack(newUndo);
        setRedoStack(newRedo);
        setPaintedCells(previous);
    };

    const redo = () => {
        const redoStack = redoRef.current;
        if (redoStack.length === 0) return;

        const current = paintedCellsRef.current;
        const next = redoStack[redoStack.length - 1];

        const newRedo = redoStack.slice(0, -1);
        const newUndo = [...undoRef.current, [...current]];

        undoRef.current = newUndo;
        redoRef.current = newRedo;

        setUndoStack(newUndo);
        setRedoStack(newRedo);
        setPaintedCells(next);
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
            const dx = pointer.x - lastPos.x;
            const dy = pointer.y - lastPos.y;
            setLayerOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPos({ x: pointer.x, y: pointer.y });
        } else if (isPainting) {
            paintCell(pointer.x, pointer.y);
        } else if (isErasing) {
            eraseCell(pointer.x, pointer.y);
        }
    };

    const pushHistory = () => {
        const current = paintedCellsRef.current;

        setUndoStack((prev) => [...prev, [...current]]);
        redoRef.current = [];
        setRedoStack([]);
    };

    const handleMapCreated = (mapName: string) => {
        const newMap: Map = { id: Date.now(), name: mapName, tiles: [] };
        setMaps((prev) => [...prev, newMap]);
    };

    // Paint a cell at the pointer position (snapped to grid)
    const paintCell = (x: number, y: number) => {
        const localX = (x - layerOffset.x) / scale;
        const localY = (y - layerOffset.y) / scale;

        const gridX = Math.floor(localX / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.floor(localY / GRID_SIZE) * GRID_SIZE;

        const exists = paintedCells.some(
            (c) => c.x === gridX && c.y === gridY && c.tileName === image,
        );
        if (!exists) {
            const taken = paintedCells.some((c) => c.x === gridX && c.y === gridY);
            if (!taken) {
                setPaintedCells((prev) => [...prev, { x: gridX, y: gridY, tileName: image }]);
            } else {
                setPaintedCells((prev) =>
                    prev.map((c) =>
                        c.x === gridX && c.y === gridY
                            ? { x: gridX, y: gridY, tileName: image }
                            : c,
                    ),
                );
            }
        }
    };

    const eraseCell = (x: number, y: number) => {
        const localX = (x - layerOffset.x) / scale;
        const localY = (y - layerOffset.y) / scale;

        const gridX = Math.floor(localX / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.floor(localY / GRID_SIZE) * GRID_SIZE;

        const exists = paintedCells.some((c) => c.x === gridX && c.y === gridY);
        if (!exists) return;

        setPaintedCells((prev) => prev.filter((c) => !(c.x === gridX && c.y === gridY)));
    };

    // Optional zoom
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = scale;
        const scaleBy = 1.1;
        const pointer = stage.getPointerPosition()!;
        const direction = e.evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
        const newScale = oldScale * direction;
        setScale(newScale);

        const newOffsetX = pointer.x - ((pointer.x - layerOffset.x) / oldScale) * newScale;
        const newOffsetY = pointer.y - ((pointer.y - layerOffset.y) / oldScale) * newScale;
        setLayerOffset({ x: newOffsetX, y: newOffsetY });
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
                                    className="Map"
                                    onClick={() => {
                                        setSelectedMap(map);
                                        setPaintedCells([]);
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
                    cursor: isPanning
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
