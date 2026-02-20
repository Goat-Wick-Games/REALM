import { createContext, useContext } from 'react';

type SettingsContextType = {
    settings: Settings;
    loaded: boolean;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be inside a SettingsProvider');
    return context;
};
