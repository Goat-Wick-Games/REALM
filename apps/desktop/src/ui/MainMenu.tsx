import React, { useState } from 'react';
import './MainMenu.css';
import { getCurrentWindow } from '@tauri-apps/api/window';
import SettingsPopup from '../components/SettingsPopup';
import ExitPopup from '../components/ExitPopup';
import { useTheme } from '../theme/ThemeContext';

type menuTypes = 'host' | 'join' | 'manage character' | 'manage realm' | 'settings' | 'exit' | '';

type MainMenuProps = {
    onManageRealm: () => void;
    onManageCharacter: () => void;
};

const MainMenu: React.FC<MainMenuProps> = (props) => {
    const { onManageCharacter, onManageRealm } = props;
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
        const { innerWidth, innerHeight } = window;

        // normalize -1 → 1
        const x = (e.clientX / innerWidth - 0.5) * 2 * -1;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = document.querySelector('.MenuBackground') as HTMLElement;
        bg.style.setProperty('--wall-x', `${x * 5 * (16 / 9)}px`);
        bg.style.setProperty('--wall-y', `${y * 5}px`);

        bg.style.setProperty('--mid-x', `${x * 12 * (16 / 9)}px`);
        bg.style.setProperty('--mid-y', `${y * 12}px`);

        bg.style.setProperty('--front-x', `${x * 20 * (16 / 9)}px`);
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

                <button disabled title="Start a Realm first">
                    Continue
                </button>
                <button disabled title="Work in Progress">
                    Tutorial
                </button>

                <button
                    title="Host a Realm for you and your friends to enjoy with you being the Realmkeeper"
                    onClick={() => open('host')}
                >
                    Host Realm
                </button>
                <button
                    title="Join a Realm where your friend is the Realmkeeper and roleplay together"
                    onClick={() => open('join')}
                >
                    Join Realm
                </button>
                <button
                    title="Create a brand new Realm you can play with your friends or edit an existing Realm"
                    onClick={() => onManageRealm()}
                >
                    Manage Realms
                </button>
                <button
                    title="Create a brand new Character you can play or edit an existing Character"
                    onClick={() => onManageCharacter()}
                >
                    Manage Characters
                </button>

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
            {openMenu === 'host' && <></>}

            {openMenu === 'join' && <></>}

            {openMenu === 'settings' && <SettingsPopup closePopup={close} />}

            {openMenu === 'exit' && <ExitPopup closePopup={close} exitApp={handleExit} />}
        </main>
    );
};

export default MainMenu;
