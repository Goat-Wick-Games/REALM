import Database from '@tauri-apps/plugin-sql';

export class RealmStore {
    private db!: Database;

    async init() {
        this.db = await Database.load('sqlite:characters.db');
        await this.db.execute(`PRAGMA foreign_keys = ON;`);
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS
                realms(
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    lastPlayed TEXT DEFAULT 'never'
                    )
        `);
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS
                players(
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    characterName TEXT NOT NULL,
                    characterRace TEXT NOT NULL,
                    characterClass TEXT NOT NULL,
                    characterBio TEXT NOT NULL,
                    characterAge INTEGER NOT NULL,
                    realmId INTEGER NOT NULL,
                    FOREIGN KEY (realmId) REFERENCES realms(id) ON DELETE CASCADE
                    )
        `);
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS
                maps(
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    width INTEGER NOT NULL,
                    height INTEGER NOT NULL,
                    realmId INTEGER NOT NULL,
                    FOREIGN KEY (realmId) REFERENCES realms(id) ON DELETE CASCADE
                    )
        `);
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS
                tiles(
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    x INTEGER NOT NULL,
                    y INTEGER NOT NULL,
                    tileName TEXT NOT NULL,
                    trigger TEXT,
                    walkable INTEGER NOT NULL,
                    mapId INTEGER NOT NULL,
                    FOREIGN KEY (mapId) REFERENCES maps(id) ON DELETE CASCADE
                    )
        `);
    }
}
