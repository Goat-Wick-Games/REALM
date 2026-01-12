import React, { useState } from 'react';
import './MainMenu.css';
import { getCurrentWindow } from '@tauri-apps/api/window';
import SettingsPopup from '../components/SettingsPopup';
import ExitPopup from '../components/ExitPopup';
import { useTheme } from '../theme/ThemeContext';

type menuTypes = 'host' | 'join' | 'create character' | 'create realm' | 'settings' | 'exit' | '';

const MainMenu: React.FC = () => {
    const [openMenu, setOpenMenu] = useState<menuTypes>('');
    const { theme } = useTheme();

    const open = (menu: menuTypes) => {
        openMenu === menu ? close() : setOpenMenu(menu);
    };
    const close = () => setOpenMenu('');

    // --- Exit logic ---
    const handleExit = async () => {
        const appWindow = getCurrentWindow();
        await appWindow.close();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        console.log('move');
        const { innerWidth, innerHeight } = window;

        // normalize -1 → 1
        const x = (e.clientX / innerWidth - 0.5) * 2 * -1;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = document.querySelector('.MenuBackground') as HTMLElement;
        bg.style.setProperty('--wall-x', `${x * 5}px`);
        bg.style.setProperty('--wall-y', `${y * 5}px`);

        bg.style.setProperty('--mid-x', `${x * 12}px`);
        bg.style.setProperty('--mid-y', `${y * 12}px`);

        bg.style.setProperty('--front-x', `${x * 20}px`);
        bg.style.setProperty('--front-y', `${y * 20}px`);
    };

    return (
        <main className="MainMenu" onMouseMove={(e) => handleMouseMove(e)}>
            {/* FALSE 3D BACKGROUND */}
            <div className="MenuBackground">
                <img src={`/bg/wall-${theme}.svg`} className="bg layer-wall" />
                <img src={`/bg/floor-${theme}.svg`} className="bg layer-wall" />
                <img src="/bg/bartender.svg" className="bg layer-bartender" />
                <img src={`/bg/bar-${theme}.svg`} className="bg layer-bar" />
            </div>

            {/* UI */}
            <div className="Sidebar">
                <h1>
                    RE<span className="Slash">/\</span>LM
                </h1>

                <button disabled title="Start a campaign first">
                    Continue
                </button>
                <button disabled title="Work in Progress">
                    Tutorial
                </button>

                <button onClick={() => open('host')}>Host Realm</button>
                <button onClick={() => open('join')}>Join Realm</button>
                <button onClick={() => open('create realm')}>Create Realm</button>
                <button onClick={() => open('create character')}>Create Character</button>

                <button
                    className="Settings-btn"
                    title="Settings for the game, the client and the inner works"
                    onClick={() => open('settings')}
                >
                    Settings
                </button>

                <button
                    className="Exit-btn"
                    title="Leave the application"
                    onClick={() => open('exit')}
                >
                    Exit
                </button>
            </div>

            {/* POPUPS */}
            {openMenu === 'settings' && <SettingsPopup closePopup={close} />}

            {openMenu === 'exit' && <ExitPopup closePopup={close} exitApp={handleExit} />}
        </main>
    );
};

export default MainMenu;
