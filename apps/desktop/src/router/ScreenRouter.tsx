import { useEffect, useRef, useState } from 'react';
import type { Screen } from '../types/screen';
import IntroSmash from '../screens/IntroSmash';
import MainMenu from '../ui/MainMenu';
import ManageCharacter from '../screens/ManageCharacter';
import ManageRealm from '../screens/ManageRealm';
import GameScreen from '../screens/GameScreen';
import { SettingsStore } from '@realm/storage';

const ScreenRouter: React.FC = () => {
    const settings = useRef(new SettingsStore('settings.json')).current;
    const [screen, setScreen] = useState<Screen>('menu');
    const [showMainMenu, setShowMainMenu] = useState<boolean>();
    const [showIntro, setShowIntro] = useState<boolean>();

    useEffect(() => {
        (async () => {
            await settings.init();
            const skipIntro: boolean | undefined = await settings.get('skipIntro');
            if (skipIntro === undefined) return;
            setShowIntro(!skipIntro);
            setShowMainMenu(skipIntro);
        })();
    }, []);

    const backToMainMenu = () => {
        setShowIntro(false);
        setShowMainMenu(true);
        setScreen('menu');
    };
    const editMap = () => {
        setScreen('game');
    };

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
