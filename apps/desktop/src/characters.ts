import { AppStore } from './storage';

export class CharactersStore {
    private appStore: AppStore;
    private key = 'characters';

    constructor() {
        this.appStore = new AppStore('characters.json'); // optional custom file
    }

    /** Initialize the store */
    async init() {
        await this.appStore.init();
        // Ensure key exists
        const existing = await this.appStore.get<Character[]>(this.key);
        if (!existing) {
            await this.appStore.set(this.key, []);
            await this.appStore.save();
        }
    }

    /** Get all characters */
    async getAll(): Promise<Character[]> {
        return (await this.appStore.get<Character[]>(this.key)) || [];
    }

    /** Get a single character by name */
    async getByName(name: string): Promise<Character | undefined> {
        const characters = await this.getAll();
        return characters.find((c) => c.name === name);
    }

    /** Add a new character */
    async add(character: Character): Promise<void> {
        const characters = await this.getAll();
        characters.push(character);
        await this.appStore.set(this.key, characters);
        await this.appStore.save();
    }

    /** Update an existing character by name */
    async update(name: string, updated: Partial<Character>): Promise<void> {
        const characters = await this.getAll();
        const index = characters.findIndex((c) => c.name === name);
        if (index === -1) return;
        characters[index] = { ...characters[index], ...updated };
        await this.appStore.set(this.key, characters);
        await this.appStore.save();
    }

    /** Delete a character */
    async remove(name: string): Promise<void> {
        const characters = await this.getAll();
        const filtered = characters.filter((c) => c.name !== name);
        await this.appStore.set(this.key, filtered);
        await this.appStore.save();
    }
}
