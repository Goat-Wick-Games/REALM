import { Classes } from './class';
import { Races } from './races';

export type Character = {
    id: number;
    name: string;
    class: Classes;
    race: Races;
    age: number;
    bio: string;
    createdAt: string;
    lastPlayed: string;
};
