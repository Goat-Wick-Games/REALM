import React, { useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import './GameScreen.css';

type GameScreenProps = { onBack: () => void };

const GRID_SIZE = 50; // size of each grid cell in pixels

const GameScreen: React.FC<GameScreenProps> = ({ onBack }) => {
    const [editMode, setEditMode] = useState(false);
    const [layerOffset, setLayerOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: any) => {
        if (e.evt.button === 1) {
            setIsPanning(true);
            setLastPos({ x: e.evt.clientX, y: e.evt.clientY });
        }
    };

    const handleMouseUp = (e: any) => {
        if (e.evt.button === 1) setIsPanning(false);
    };

    const handleMouseMove = (e: any) => {
        if (!isPanning) return;
        const dx = e.evt.clientX - lastPos.x;
        const dy = e.evt.clientY - lastPos.y;
        setLayerOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.evt.clientX, y: e.evt.clientY });
    };

    // Generate grid lines
    const generateGridLines = () => {
        const width = GRID_SIZE * 128;
        const height = GRID_SIZE * 72;
        const lines = [];

        // Vertical lines
        for (let x = 0; x <= width; x += GRID_SIZE) {
            lines.push(
                <Line key={`v-${x}`} points={[x, 0, x, height]} stroke="#ccc" strokeWidth={1} />,
            );
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += GRID_SIZE) {
            lines.push(
                <Line key={`h-${y}`} points={[0, y, width, y]} stroke="#ccc" strokeWidth={1} />,
            );
        }

        return lines;
    };

    return (
        <main className="GameScreen">
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
            </div>

            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                style={{ background: 'transparent', cursor: isPanning ? 'grabbing' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={(e) => e.evt.preventDefault()}
            >
                {/* Objects Layer: moves with camera */}
                <Layer x={layerOffset.x} y={layerOffset.y}>
                    <Rect
                        x={GRID_SIZE * 2}
                        y={GRID_SIZE * 2}
                        width={GRID_SIZE}
                        height={GRID_SIZE}
                        fill="red"
                        draggable={editMode}
                    />
                    <Rect
                        x={GRID_SIZE * 6}
                        y={GRID_SIZE * 4}
                        width={GRID_SIZE}
                        height={GRID_SIZE}
                        fill="blue"
                        draggable={editMode}
                    />
                    {generateGridLines()}
                </Layer>
            </Stage>
        </main>
    );
};

export default GameScreen;
