import { useState } from 'react';
import type { Screen } from '../types/screen';
import IntroSmash from '../screens/IntroSmash';
import MainMenu from '../ui/MainMenu';
import ManageCharacter from '../screens/ManageCharacter';
import ManageRealm from '../screens/ManageRealm';
import GameScreen from '../screens/GameScreen';

const ScreenRouter: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('game');
    const [showMainMenu, setShowMainMenu] = useState<boolean>(false);
    const [showIntro, setShowIntro] = useState<boolean>(true);

    const backToMainMenu = () => {
        setShowIntro(false);
        setShowMainMenu(true);
        setScreen('menu');
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
            return <ManageRealm onBack={backToMainMenu} />;
        case 'game':
            return <GameScreen onBack={backToMainMenu} />;
        default:
            return null;
    }
};

export default ScreenRouter;
