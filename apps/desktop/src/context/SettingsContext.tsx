// SettingsContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { SettingsStore } from '@realm/storage';
import type { Display } from '../Display';

export type QualityLevels = 'high' | 'normal' | 'low';

export type Theme = 'light' | 'dark' | 'system';

export type Settings = {
    // Game
    fastInteraction: boolean;
    skipIntro: boolean;
    // Video
    renderQuality: QualityLevels;
    fpsLock: boolean;
    fpsLimit: number;
    display: Display;
    // Audio
    music: number;
    sound: number;
    ambient: number;
    uiSound: number;
    // Extras
    reducedMotion: boolean;
    showFps: boolean;
    theme: Theme;
};

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

type SettingsContextType = {
    settings: Settings;
    loaded: boolean;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

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
                if (val !== undefined && val !== null) loaded[key] = val as any;
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

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be inside a SettingsProvider');
    return context;
};
