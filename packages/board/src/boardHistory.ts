import type { HistoryState } from './boardTypes';

export type UndoRedoState = {
    previous: HistoryState;
    newUndo: HistoryState[];
    newRedo: HistoryState[];
};

export const pushHistoryState = (
    undoStack: HistoryState[],
    current: HistoryState,
): HistoryState[] => [...undoStack, [...current]];

export const getUndoState = (
    undoStack: HistoryState[],
    current: HistoryState,
    redoStack: HistoryState[],
): UndoRedoState | null => {
    if (undoStack.length === 0) {
        return null;
    }

    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const newRedo = [...redoStack, [...current]];

    return {
        previous,
        newUndo,
        newRedo,
    };
};

export const getRedoState = (
    redoStack: HistoryState[],
    current: HistoryState,
    undoStack: HistoryState[],
): UndoRedoState | null => {
    if (redoStack.length === 0) {
        return null;
    }

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newUndo = [...undoStack, [...current]];

    return {
        previous: next,
        newUndo,
        newRedo,
    };
};
