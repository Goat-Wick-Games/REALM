type Player = {
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
