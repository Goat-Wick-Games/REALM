import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </SettingsProvider>
    </StrictMode>,
);
