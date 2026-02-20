import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { SettingsProvider } from './providers/SettingsProvider';
import { ThemeProvider } from './providers/ThemeProvider';
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </SettingsProvider>
    </StrictMode>,
);
