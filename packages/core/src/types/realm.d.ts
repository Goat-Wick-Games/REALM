import type { map } from './map';
import { Player } from './player';

export type Realm = {
    id: string;
    name: string;
    maps: map[];
    players: Player[];
    createdAt: string;
    lastPlayed: string;
};
