import { useEffect, useRef, useState } from 'react';
import './ManageRealm.css';
import { AppStore } from '../AppStore';
import { useTheme } from '../theme/ThemeContext';
import RealmElement from '../components/RealmElement';

type ManageRealmProps = {
    onBack: () => void;
};

const ManageRealm: React.FC<ManageRealmProps> = (props) => {
    const { onBack } = props;

    const containerRef = useRef<HTMLElement | null>(null);
    const [reducedMotion, setReducedMotion] = useState<boolean>(true);
    const settings = useRef(new AppStore('settings.json')).current;
    const { theme } = useTheme();

    useEffect(() => {
        (async () => {
            await settings.init();
            setReducedMotion((await settings.get('reducedMotion')) || false);
        })();
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (reducedMotion) return;
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2 * -1;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = containerRef.current;
        for (let i = 1; i <= 5; i++) {
            bg?.style.setProperty(`--hole-${i}-x`, `${x * i ** 2 * (16 / 9)}px`);
            bg?.style.setProperty(`--hole-${i}-y`, `${y * i ** 2}px`);
        }
    };

    return (
        <main className="ManageRealm" ref={containerRef} onMouseMove={(e) => handleMouseMove(e)}>
            <button className="BackBtn" onClick={onBack}>
                ←
            </button>
            <div className="Topbar">
                <h1 className="Title">
                    RE<span className="Slash">/\</span>LMS
                </h1>
            </div>
            <div className="Content">
                <div className="ListArea">
                    <div className="InnerArea">
                        <RealmElement realmList={[]} />
                    </div>
                </div>
                <div className="PlayArea">
                    <div className="Map">
                        <h3>Map of the world (click to edit)</h3>
                        <img src="" alt="" />
                    </div>
                    <div className="Players">
                        <h3>Players in your REALM</h3>
                    </div>
                    <div className="Play">
                        <button>Play</button>
                    </div>
                </div>
            </div>
            <div className="MenuBackground">
                <img src={`/bg/hole-${theme}-5.svg`} alt="MenuHole" className="bg layer-hole-1" />
                <img src={`/bg/hole-${theme}-4.svg`} alt="MenuHole" className="bg layer-hole-2" />
                <img src={`/bg/hole-${theme}-3.svg`} alt="MenuHole" className="bg layer-hole-3" />
                <img src={`/bg/hole-${theme}-2.svg`} alt="MenuHole" className="bg layer-hole-4" />
                <img src={`/bg/hole-${theme}-1.svg`} alt="MenuHole" className="bg layer-hole-5" />
            </div>
        </main>
    );
};

export default ManageRealm;
