import { Tile } from './tile';
import { Trigger } from './trigger';

export type map = {
    name: string;
    bounds: Tile[];
    triggers: { tile: Tile; trigger: Trigger }[];
    tileset: Tile[];
    size: {
        width: number;
        height: number;
    };
};
