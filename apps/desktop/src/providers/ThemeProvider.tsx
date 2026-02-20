import { createContext, useEffect, type ReactNode } from 'react';
import { useSettings } from '../context/SettingsContext';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings, updateSetting } = useSettings();

    // Resolve actual theme
    const resolveTheme = (t: Theme): Theme => {
        if (t === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return t;
    };

    const theme = resolveTheme(settings.theme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (t: Theme) => {
        updateSetting('theme', t); // update in SettingsContext
    };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
