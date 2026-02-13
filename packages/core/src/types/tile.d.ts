import { Trigger } from './trigger';

export type Tile = {
    id: number;
    x: number;
    y: number;
    tileName: string;
    trigger?: Trigger;
    walkable: boolean;
    mapId: number;
};
