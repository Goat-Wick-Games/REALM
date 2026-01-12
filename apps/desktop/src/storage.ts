import { load, Store } from '@tauri-apps/plugin-store';

export class AppStore {
    private store!: Store;
    private filename!: string;
    constructor(filename = 'store.json') {
        this.filename = filename;
    }

    /** Must be called once before using the store */
    async init() {
        this.store = await load(this.filename);
    }

    async set<T>(key: string, value: T): Promise<void> {
        await this.store.set(key, value);
    }

    async get<T>(key: string): Promise<T | undefined> {
        return await this.store.get<T>(key);
    }

    async save(): Promise<void> {
        await this.store.save();
    }
}
