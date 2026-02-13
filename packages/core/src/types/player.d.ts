import { Classes } from './class';
import { Races } from './races';

export type Player = {
    id: number;
    name: string;
    characterName: string;
    characterRace: Races;
    characterClass: Classes;
    characterBio: string;
    characterAge: number;
    realmId: number;
};
