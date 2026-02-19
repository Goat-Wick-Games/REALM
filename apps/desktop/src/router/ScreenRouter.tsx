import { useEffect, useState } from 'react';
import type { Screen } from '../types/screen';
import IntroSmash from '../screens/IntroSmash';
import MainMenu from '../screens/MainMenu';
import ManageCharacter from '../screens/ManageCharacter';
import ManageRealm from '../screens/ManageRealm';
import GameScreen from '../screens/GameScreen';
import { useSettings } from '../context/SettingsContext';

const ScreenRouter: React.FC = () => {
    const { settings, loaded } = useSettings();
    const [screen, setScreen] = useState<Screen>('game');
    const [showMainMenu, setShowMainMenu] = useState<boolean>();
    const [showIntro, setShowIntro] = useState<boolean>();

    useEffect(() => {
        if (!loaded) return;
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
            return <GameScreen onBack={backToMainMenu} />;
        default:
            return null;
    }
};

export default ScreenRouter;
