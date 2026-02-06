import races from './fix-data/character-bases.json';
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
        const characters = (await this.appStore.get<Character[]>(this.key)) ?? [];

        // Normalize every character and assign sequential IDs starting from 1
        const normalized = characters.map((c, index) => this.normalizeCharacter(c, index + 1));

        // Always save the normalized list to ensure consistency
        await this.appStore.set(this.key, normalized);
        await this.appStore.save();

        return normalized;
    }

    private normalizeCharacter(character: Character, nextId: number): Character {
        const raceList = ['', 'orc', 'elf', 'human', 'fiend', 'cyborg'];
        const classList = ['', 'barbarian', 'druid', 'assassin', 'hunter', 'craftsman'];
        const now = new Date().toISOString();

        // Simple Levenshtein distance
        function levenshtein(firstText: string, secondText: string): number {
            const distance: number[][] = Array(firstText.length + 1)
                .fill(0)
                .map(() => Array(secondText.length + 1).fill(0));

            for (let i = 0; i <= firstText.length; i++) distance[i][0] = i;
            for (let j = 0; j <= secondText.length; j++) distance[0][j] = j;

            for (let i = 1; i <= firstText.length; i++) {
                for (let j = 1; j <= secondText.length; j++) {
                    distance[i][j] =
                        firstText[i - 1] === secondText[j - 1]
                            ? distance[i - 1][j - 1]
                            : Math.min(
                                  distance[i - 1][j - 1], // substitution
                                  distance[i][j - 1], // insertion
                                  distance[i - 1][j], // deletion
                              ) + 1;
                }
            }
            return distance[firstText.length][secondText.length];
        }

        // Pick closest match from a list
        function closestMatch(value: string, list: string[]): string {
            if (!value) return '';
            let best = '';
            let bestDist = Infinity;
            for (const option of list) {
                const dist = levenshtein(value.toLowerCase(), option.toLowerCase());
                if (dist < bestDist) {
                    bestDist = dist;
                    best = option;
                }
            }

            // Use proportional threshold: allow more edits for longer names
            return bestDist <= Math.max(1, Math.floor(best.length * 0.4)) ? best : '';
        }

        let age = character.age;

        if (character && character.race) {
            const maxAge = races[character.race].maxAge;
            age = character.age > maxAge ? maxAge : character.age;
        }

        return {
            // ALWAYS assign a fresh ID
            id: `c${nextId.toString().padStart(3, '0')}`,
            createdAt: character.createdAt ?? now,
            lastPlayed: character.lastPlayed ?? now,
            name: character.name ?? '',
            age: age ?? 0,
            bio: character.bio ?? '',
            class: closestMatch(character.class ?? '', classList) as Classes,
            race: closestMatch(character.race ?? '', raceList) as Races,
        };
    }

    /** Get a single character by name */
    async getByName(name: string): Promise<Character | undefined> {
        const characters = await this.getAll();
        const char: Character | undefined = characters.find((c) => c.name === name);
        if (!char) return undefined;
        return char;
    }

    /** Add a new character */
    async add(character: Character): Promise<void> {
        const characters = await this.getAll();
        characters.push(character);
        await this.appStore.set(this.key, characters);
        await this.appStore.save();
    }

    /** Update an existing character by name */
    async update(id: string, updated: Partial<Character>): Promise<void> {
        const characters = await this.getAll();
        const index = characters.findIndex((c) => c.id === id);
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

    async getMaxId(): Promise<number> {
        const allChars = await this.getAll();

        return allChars.length > 0
            ? Math.max(...allChars.map((c) => (c.id ? parseInt(c.id.slice(1)) : 0))) + 1
            : 0;
    }
}
