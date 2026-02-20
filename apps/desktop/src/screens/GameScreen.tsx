import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import './GameScreen.css';
import { useTheme } from '../context/ThemeContext';

type GameScreenProps = { onBack: () => void; editing: boolean };

type Tile = { x: number; y: number; tileName: HTMLImageElement | null | undefined };

const GRID_SIZE = 100;

const GameScreen: React.FC<GameScreenProps> = (props) => {
    const { onBack, editing } = props;
    const planks = useRef<HTMLImageElement>(null);
    const [editMode, setEditMode] = useState(editing ?? false);
    const [layerOffset, setLayerOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const { theme } = useTheme();
    const [, setHistory] = useState<Tile[][]>([]);
    const [isPainting, setIsPainting] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [image, setImage] = useState<HTMLImageElement | null>();
    const [paintedCells, setPaintedCells] = useState<Tile[]>([]);

    useEffect(() => {
        const prevent = (e: MouseEvent) => e.preventDefault();
        window.addEventListener('contextmenu', prevent);
        return () => window.removeEventListener('contextmenu', prevent);
    }, []);

    useEffect(() => {
        const handleUndo = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                setHistory((prev) => {
                    if (prev.length === 0) return prev;

                    const copy = [...prev];
                    const last = copy.pop()!;
                    setPaintedCells(last);
                    return copy;
                });
            }
        };

        window.addEventListener('keydown', handleUndo);
        return () => window.removeEventListener('keydown', handleUndo);
    }, []);

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
            setIsPainting(true);
            paintCell(pointer.x, pointer.y);
        }

        // RIGHT CLICK → erase
        if (e.evt.button === 2) {
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
        setHistory((prev) => [...prev, paintedCells]);
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
            pushHistory(); // ✅ save state before change
            setPaintedCells((prev) => [...prev, { x: gridX, y: gridY, tileName: image }]);
        }
    };

    const eraseCell = (x: number, y: number) => {
        const localX = (x - layerOffset.x) / scale;
        const localY = (y - layerOffset.y) / scale;

        const gridX = Math.floor(localX / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.floor(localY / GRID_SIZE) * GRID_SIZE;

        const exists = paintedCells.some((c) => c.x === gridX && c.y === gridY);
        if (!exists) return;

        pushHistory(); // ✅ undo support

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
            <img src={`/bg/REALM-${theme}.svg`} alt="Background" />
            <div className="UI">
                <button className="BackBtn" onClick={onBack}>
                    ←
                </button>
                <aside className="Maps Sidebar">
                    <div className="Title">
                        <div className="checkbox-wrapper-8">
                            <input
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
                                            className="Planks"
                                            onClick={() => setImage(planks.current)}
                                        >
                                            <img
                                                ref={planks}
                                                src={`/tiles/floor/${theme}/plank.svg`}
                                                alt="Planks"
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
                style={{ cursor: editMode ? 'crosshair' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Objects & grid Layer */}
                <Layer x={layerOffset.x} y={layerOffset.y} scaleX={scale} scaleY={scale}>
                    {/* Painted cells */}
                    {paintedCells.map((cell, i) => (
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
