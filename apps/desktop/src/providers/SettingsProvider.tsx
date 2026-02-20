import { useState, useEffect, type ReactNode } from 'react';
import { SettingsStore } from '@realm/storage';
import { SettingsContext } from '../context/SettingsContext';

const defaultSettings: Settings = {
    fastInteraction: false,
    skipIntro: false,
    renderQuality: 'normal',
    fpsLock: true,
    fpsLimit: 60,
    display: 'windowed',
    music: 50,
    sound: 50,
    ambient: 50,
    uiSound: 50,
    reducedMotion: false,
    showFps: false,
    theme: 'system',
};
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [loaded, setLoaded] = useState(false);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [store, setStore] = useState<SettingsStore | null>(null);

    // Initialize the store once
    useEffect(() => {
        const initStore = async () => {
            const s = new SettingsStore('settings.json');
            await s.init();

            // Load saved settings
            const loaded: Partial<Settings> = {};
            for (const key of Object.keys(defaultSettings) as Array<keyof Settings>) {
                const val = await s.get(key);
                if (val !== undefined && val !== null)
                    (loaded[key] as Settings[typeof key]) = val as Settings[typeof key];
            }
            setSettings((prev) => ({ ...prev, ...loaded }));
            setStore(s);
            setLoaded(true);
        };
        initStore();
    }, []);

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        if (store) store.set(key, value); // save asynchronously
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        if (store) {
            Object.entries(defaultSettings).forEach(([key, val]) =>
                store.set(key as keyof Settings, val),
            );
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, loaded }}>
            {children}
        </SettingsContext.Provider>
    );
};
