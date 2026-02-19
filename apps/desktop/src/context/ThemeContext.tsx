import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSettings, type Theme as SettingsTheme } from './SettingsContext';

export type Theme = 'light' | 'dark'; // always resolved to light/dark

type ThemeContextType = {
    theme: Theme; // resolved theme
    setTheme: (t: SettingsTheme) => void; // update setting
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings, updateSetting } = useSettings();

    // Resolve actual theme
    const resolveTheme = (t: SettingsTheme): Theme => {
        if (t === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return t;
    };

    const theme = resolveTheme(settings.theme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (t: SettingsTheme) => {
        updateSetting('theme', t); // update in SettingsContext
    };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
