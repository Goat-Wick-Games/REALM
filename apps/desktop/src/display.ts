import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { AppStore } from '@realm/storage';

export type Display = 'fullscreen' | 'windowed fullscreen' | 'windowed';

const settings = new AppStore('settings.json');

export const setDisplay = async (display: Display) => {
    await settings.init();
    changeWindow(display);
    await settings.set('display', display);
};

export const loadDisplay = async () => {
    await settings.init();
    const display: Display = (await settings.get('display')) ?? 'windowed';
    changeWindow(display);
};

const changeWindow = async (display: Display) => {
    const win: Window = getCurrentWindow();
    switch (display) {
        case 'fullscreen':
            await win.setDecorations(true);
            await win.setFullscreen(true);
            break;

        case 'windowed fullscreen':
            await win.setFullscreen(false);
            await win.maximize();
            await win.setDecorations(false);
            break;

        case 'windowed':
            await win.setFullscreen(false);
            await win.unmaximize();
            await win.setDecorations(true);
            break;
    }
};
