import { AppStore } from './AppStore';
import races from './fix-data/character-bases.json';

export class RealmStore {
    private appStore: AppStore;
    private key = 'realms';

    constructor() {
        this.appStore = new AppStore(`${this.key}.json`); // optional custom file
    }

    /** Initialize the store */
    async init() {
        await this.appStore.init();
        // Ensure key exists
        const existing = await this.appStore.get<Realm[]>(this.key);
        if (!existing) {
            await this.appStore.set(this.key, []);
            await this.appStore.save();
        }
    }

    /** Get all realms */
    async getAll(): Promise<Realm[]> {
        const realms = (await this.appStore.get<Realm[]>(this.key)) ?? [];

        // Normalize every realm and assign sequential IDs starting from 1
        const normalized = realms.map((r, index) => this.normalizeRealm(r, index + 1));

        // Always save the normalized list to ensure consistency
        await this.appStore.set(this.key, normalized);
        await this.appStore.save();

        return normalized;
    }

    private normalizeRealm(realm: Realm, nextId: number): Realm {
        const now = new Date().toISOString();

        return {
            // ALWAYS assign a fresh ID
            id: `r${nextId.toString().padStart(3, '0')}`,
            players: realm.players.map((p: Player, index: number) =>
                this.normalizePlayer(p, index),
            ),
            createdAt: realm.createdAt ?? now,
            lastPlayed: realm.lastPlayed ?? now,
            name: realm.name ?? '',
        };
    }

    private normalizePlayer(player: Player, nextId: number): Player {
        const raceList = ['', 'orc', 'elf', 'human', 'fiend', 'cyborg'];
        const classList = ['', 'barbarian', 'druid', 'assassin', 'hunter', 'craftsman'];

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

        let age = player.character.age;

        if (player.character && player.character.race) {
            const maxAge = races[player.character.race].maxAge;
            age = player.character.age > maxAge ? maxAge : player.character.age;
        }

        return {
            name: player.name ?? '',
            id: `p${nextId.toString().padStart(3, '0')}`,
            character: {
                name: player.character.name ?? '',
                age: age ?? 0,
                bio: player.character.bio ?? '',
                class: closestMatch(player.character.class ?? '', classList) as Classes,
                race: closestMatch(player.character.race ?? '', raceList) as Races,
            },
        };
    }

    /** Add a new realm */
    async add(realm: Realm): Promise<void> {
        const realms = await this.getAll();
        realms.push(realm);
        await this.appStore.set(this.key, realms);
        await this.appStore.save();
    }

    /** Add a new player to a realm */
    async addPlayer(id: string, player: Player): Promise<void> {
        const realms = await this.getAll();
        const index = realms.findIndex((r) => r.id === id);
        if (index === -1) return;
        realms[index].players.push(player);
        await this.appStore.set(this.key, realms);
        await this.appStore.save();
    }

    /** Update an existing realm by name */
    async update(id: string, updated: Partial<Realm>): Promise<void> {
        const realms = await this.getAll();
        const index = realms.findIndex((c) => c.id === id);
        if (index === -1) return;
        realms[index] = { ...realms[index], ...updated };
        await this.appStore.set(this.key, realms);
        await this.appStore.save();
    }

    /** Update a player in a realm */
    async updatePlayer(
        id: string,
        playerId: string,
        updatedPlayer: Partial<Player>,
    ): Promise<void> {
        const realms = await this.getAll();
        const index = realms.findIndex((r) => r.id === id);
        if (index === -1) return;
        realms[index].players = realms[index].players.map((p) => {
            if (p.id === playerId)
                return {
                    ...p,
                    ...updatedPlayer,
                };
            return p;
        });
        await this.appStore.set(this.key, realms);
        await this.appStore.save();
    }

    /** Delete a realm */
    async remove(name: string): Promise<void> {
        const characters = await this.getAll();
        const filtered = characters.filter((c) => c.name !== name);
        await this.appStore.set(this.key, filtered);
        await this.appStore.save();
    }

    /** Remove a player from a realm */
    async removePlayer(id: string, playerId: string): Promise<void> {
        const realms = await this.getAll();
        const index = realms.findIndex((r) => r.id === id);
        if (index === -1) return;
        const filtered = realms[index].players.filter((p) => p.id !== playerId);
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
