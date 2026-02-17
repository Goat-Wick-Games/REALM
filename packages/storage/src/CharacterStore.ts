import Database from '@tauri-apps/plugin-sql';
import { open } from '@tauri-apps/plugin-dialog';
import type { Character, Classes, Races } from '@realm/core';
import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { openPath } from '@tauri-apps/plugin-opener';
import { downloadDir } from '@tauri-apps/api/path';

export class CharacterStore {
    private db!: Database;

    async init() {
        this.db = await Database.load('sqlite:characters.db');

        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS
                characters(
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    bio TEXT,
                    class TEXT,
                    race TEXT,
                    age INTEGER NOT NULL,
                    createdAt TEXT,
                    lastPlayed TEXT DEFAULT "never")
        `);
    }

    public async getAll(): Promise<Character[]> {
        return (await this.db.select(`SELECT * FROM characters`)) as Character[];
    }

    public async add(name: string, $class: Classes, race: Races, age: number, bio: string) {
        const date = new Date().toISOString().split('T')[0];
        await this.db.execute(
            `INSERT INTO characters(name, class, race, age, bio, createdAt)
                VALUES(?,?,?,?,?,?)`,
            [name, $class, race, age, bio, date],
        );
    }

    public async update(
        id: number,
        name: string,
        $class: Classes,
        race: Races,
        age: number,
        bio: string,
    ) {
        const date = new Date().toISOString().split('T')[0];
        await this.db.execute(
            `UPDATE characters
                SET name = ?, class = ?, race = ?, age = ?, bio = ?
                WHERE id = ?`,
            [name, $class, race, age, bio, id],
        );
    }

    public async deleteCharacter(id: number): Promise<boolean> {
        const result = await this.db.execute(`DELETE FROM characters WHERE id = ?`, [id]);
        return result.rowsAffected > 0;
    }

    /** Export all characters to a JSON file */
    public async exportToJSON(id: number): Promise<{
        result: boolean;
        reason: string;
    }> {
        try {
            const characters = (await this.db.select(`SELECT * FROM characters WHERE id = ?`, [
                id,
            ])) as Character[];

            if (!characters.length) return { result: false, reason: 'character not found' };

            const character = JSON.stringify(characters[0]);

            const downloadDirPath = await downloadDir();

            await openPath(downloadDirPath);

            await writeTextFile(`${characters[0].name}.json`, character, {
                baseDir: BaseDirectory.Download,
                create: true,
            });

            return { result: true, reason: 'exported successfully' };
        } catch (err) {
            console.error(`Failed to import character`, err);
            return { result: false, reason: 'error during import' };
        }
    }

    /** Import characters from a JSON file */
    public async importFromJSON(): Promise<{
        result: boolean;
        reason: string;
        character?: Character;
    }> {
        try {
            const selected = await open({
                multiple: false,
                directory: false,
                defaultPath: BaseDirectory.Download.toString(),
                filters: [
                    {
                        name: 'Json files',
                        extensions: ['json'],
                    },
                ],
            });

            if (!selected) return { result: false, reason: 'nothing selected' };

            const content = await readTextFile(selected, { baseDir: BaseDirectory.AppData });

            // user selected a single file
            const char: Character = JSON.parse(content);

            // Check for duplicates by name, bio, race, and class
            const existing = (await this.db.select(
                `SELECT * FROM characters WHERE name = ? AND bio = ? AND race = ? AND class = ?`,
                [char.name, char.bio, char.race, char.class],
            )) as Character[];

            if (existing.length > 0) return { result: false, reason: 'character already exists' };

            // Insert character
            await this.db.execute(
                `INSERT INTO characters(name, bio, class, race, age, createdAt, lastPlayed)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    char.name,
                    char.bio,
                    char.class as Classes,
                    char.race as Races,
                    char.age,
                    char.createdAt ?? new Date().toISOString(),
                    char.lastPlayed ?? 'never',
                ],
            );
            return { result: true, reason: 'character added', character: char };
        } catch (err) {
            console.error(`Failed to import character`, err);
            return { result: false, reason: 'error during import' };
        }
    }
}
