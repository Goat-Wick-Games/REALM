import type { Coords } from './boardTypes';

export const panLayer = (previousOffset: Coords, lastPos: Coords, pointer: Coords): Coords => ({
    x: previousOffset.x + pointer.x - lastPos.x,
    y: previousOffset.y + pointer.y - lastPos.y,
});

export const zoomAt = (
    pointer: Coords,
    layerOffset: Coords,
    scale: number,
    scaleBy: number,
): { scale: number; layerOffset: Coords } => {
    const newScale = scale * scaleBy;
    const newOffsetX = pointer.x - ((pointer.x - layerOffset.x) / scale) * newScale;
    const newOffsetY = pointer.y - ((pointer.y - layerOffset.y) / scale) * newScale;

    return {
        scale: newScale,
        layerOffset: { x: newOffsetX, y: newOffsetY },
    };
};
