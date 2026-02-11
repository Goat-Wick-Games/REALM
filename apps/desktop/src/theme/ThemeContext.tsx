import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { AppStore } from '@realm/storage';

const settings = new AppStore('settings.json');

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
    theme: 'light' | 'dark'; // always resolved
    setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');

    // Detect system preference
    const resolveSystemTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    // Load theme from settings
    useEffect(() => {
        (async () => {
            await settings.init();
            const stored = (await settings.get<Theme>('theme')) || 'system';
            const resolved = stored === 'system' ? resolveSystemTheme() : stored;
            setThemeState(resolved);
        })();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (t: Theme) => {
        const resolved = t === 'system' ? resolveSystemTheme() : t;
        setThemeState(resolved);
        settings.set('theme', t); // store exactly what user picked
    };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
