import React, { useEffect, useRef, useState } from 'react';
import './MainMenu.css';
import { getCurrentWindow } from '@tauri-apps/api/window';
import SettingsPopup from '../components/SettingsPopup';
import ExitPopup from '../components/ExitPopup';
import { useTheme } from '../theme/ThemeContext';
import { AppStore } from '../AppStore';

type menuTypes = 'host' | 'join' | 'settings' | 'exit' | '';

type MainMenuProps = {
    onManageRealm: () => void;
    onManageCharacter: () => void;
};

const MainMenu: React.FC<MainMenuProps> = (props) => {
    const containerRef = useRef<HTMLElement | null>(null);
    const settings = useRef(new AppStore('settings.json')).current;
    const [reducedMotion, setReducedMotion] = useState<boolean>(true);
    const { onManageCharacter, onManageRealm } = props;
    const [openMenu, setOpenMenu] = useState<menuTypes>('');
    const { theme } = useTheme();

    useEffect(() => {
        (async () => {
            await settings.init();
            setReducedMotion((await settings.get('reducedMotion')) || false);
        })();
    }, []);

    const refresh = () => {
        (async () => {
            await settings.init();
            setReducedMotion((await settings.get('reducedMotion')) || false);
        })();
    };

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
        if (reducedMotion) return;
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2 * -1;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = containerRef.current;
        bg?.style.setProperty('--wall-x', `${x * 4 * (16 / 9)}px`);
        bg?.style.setProperty('--wall-y', `${y * 4}px`);

        bg?.style.setProperty('--wall-2-x', `${x * 6 * (16 / 9)}px`);
        bg?.style.setProperty('--wall-2-y', `${y * 6}px`);

        bg?.style.setProperty('--mid-x', `${x * 12 * (16 / 9)}px`);
        bg?.style.setProperty('--mid-y', `${y * 12}px`);

        bg?.style.setProperty('--front-x', `${x * 20 * (16 / 9)}px`);
        bg?.style.setProperty('--front-y', `${y * 20}px`);
    };

    return (
        <main ref={containerRef} className="MainMenu" onMouseMove={(e) => handleMouseMove(e)}>
            {/* FALSE 3D BACKGROUND */}
            <div className="MenuBackground">
                <img src={`/bg/wall-${theme}.svg`} alt="MenuWall" className="bg layer-wall" />
                <img src={`/bg/wall-${theme}-2.svg`} alt="MenuWall2" className="bg layer-wall-2" />
                <img src={`/bg/floor-${theme}.svg`} alt="MenuFloor" className="bg layer-wall" />
                <img src="/bg/bartender.svg" alt="MenuBartender" className="bg layer-bartender" />
                <img src={`/bg/bar-${theme}.svg`} alt="MenuBar" className="bg layer-bar" />
            </div>

            {/* UI */}
            <div className="Sidebar">
                <h1>
                    RE<span className="Slash">/\</span>LM
                </h1>

                <button disabled title="Start a REALM first">
                    Continue
                </button>
                <button disabled title="Work in Progress">
                    Tutorial
                </button>

                <button
                    title="Host a REALM for you and your friends to enjoy with you being the REALM-keeper"
                    onClick={() => open('host')}
                >
                    Host REALM
                </button>
                <button
                    title="Join a REALM where your friend is the REALM-keeper and roleplay together"
                    onClick={() => open('join')}
                >
                    Join REALM
                </button>
                <button
                    title="Create a brand new REALM you can play with your friends or edit an existing REALM"
                    onClick={() => onManageRealm()}
                >
                    Manage REALMS
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
            {openMenu === 'host' && (
                <>
                    <img src="https://http.cat/501" alt="" />
                </>
            )}

            {openMenu === 'join' && (
                <>
                    <img src="https://http.dog/501.jpg" alt="" />
                </>
            )}

            {openMenu === 'settings' && (
                <SettingsPopup closePopup={close} settingsChanged={refresh} />
            )}

            {openMenu === 'exit' && <ExitPopup closePopup={close} exitApp={handleExit} />}
        </main>
    );
};

export default MainMenu;
