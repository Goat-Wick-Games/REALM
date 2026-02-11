import { Classes } from './class';
import { Races } from './races';

export type Player = {
    id: string;
    name: string;
    character: {
        name: string;
        race: Races;
        class: Classes;
        bio: string;
        age: number;
    };
};
