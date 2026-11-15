import { useEffect, useState } from 'react';
import type { Screen } from '../types/screen';
import IntroSmash from '../screens/IntroSmash';
import MainMenu from '../screens/MainMenu';
import ManageCharacter from '../screens/ManageCharacter';
import ManageRealm from '../screens/ManageRealm';
import RealmEditScreen from '../screens/RealmEditScreen';
import { useSettings } from '../context/SettingsContext';
import { invoke } from '@tauri-apps/api/core';

const ScreenRouter: React.FC = () => {
    const { settings, loaded } = useSettings();
    const [screen, setScreen] = useState<Screen>('menu');
    const [showMainMenu, setShowMainMenu] = useState<boolean>();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [showIntro, setShowIntro] = useState<boolean>();

    useEffect(() => {
        const push = () => {
            const labels: Record<string, { details: string; stateText: string }> = {
                'menu': { details: 'In the Main Menu', stateText: 'Idle' },
                'game': { details: 'In a REALM', stateText: 'Exploring' },
                'manage realm': { details: 'Managing REALMs', stateText: 'Building' },
                'manage character': { details: 'Managing Characters', stateText: 'Creating' },
            };
            const p = labels[screen] ?? { details: 'In REALM', stateText: '' };
            invoke('set_presence', { details: p.details, stateText: p.stateText }).catch(() => {});
        };

        push();
        const id = setInterval(push, 15000);
        return () => clearInterval(id);
    }, [screen]);

    useEffect(() => {
        if (!loaded) return;
        if (settings.skipIntro === undefined) return;
        const playIntro = !settings.skipIntro;
        setShowIntro(playIntro);
        setShowMainMenu(!playIntro);
    }, [loaded]);

    const backToMainMenu = () => {
        setShowIntro(false);
        setShowMainMenu(true);
        setScreen('menu');
    };

    const editMap = () => {
        setEditMode(true);
        setScreen('game');
    };

    if (!loaded) return null;

    switch (screen) {
        case 'menu':
            return (
                <>
                    {showIntro && (
                        <IntroSmash
                            onDone={() => {
                                setShowMainMenu(true);
                                setTimeout(() => setShowIntro(false), 1000);
                            }}
                        />
                    )}
                    {showMainMenu && (
                        <MainMenu
                            onManageCharacter={() => setScreen('manage character')}
                            onManageRealm={() => setScreen('manage realm')}
                        />
                    )}
                </>
            );
        case 'manage character':
            return <ManageCharacter onBack={backToMainMenu} />;
        case 'manage realm':
            return <ManageRealm onBack={backToMainMenu} onEditMap={editMap} />;
        case 'game':
            return <RealmEditScreen onBack={backToMainMenu} editing={editMode} />;
        default:
            return null;
    }
};

export default ScreenRouter;
