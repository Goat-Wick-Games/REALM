import { useEffect, useRef, useState } from 'react';
import { SettingsStore } from '@realm/storage';
import { useTheme, type Theme } from '../theme/ThemeContext';
import type { Display } from '../Display';
import { setDisplay } from '../Display';
import { toast } from 'react-toastify';
import './SettingsPopup.css';

type SettingsPopupProps = {
    closePopup: () => void;
    settingsChanged: () => void;
};

type MenuTypes = 'video' | 'audio' | 'extras' | 'game';

type QualityLevels = 'high' | 'normal' | 'low';

const SettingsPopup: React.FC<SettingsPopupProps> = (props) => {
    const settings = useRef(new SettingsStore('settings.json')).current;
    const { setTheme } = useTheme();
    const { closePopup, settingsChanged } = props;
    const [openMenu, setOpenMenu] = useState<MenuTypes>('game');
    // Game Settings
    const [fastInteraction, setFastInteraction] = useState<boolean>();
    const [skipIntro, setSkipIntro] = useState<boolean>();
    // Video Settings
    const [renderQuality, setRenderQuality] = useState<QualityLevels>('normal');
    const [fpsLock, setFpsLock] = useState<boolean>();
    const [fpsLimit, setFpsLimit] = useState<number | null>();
    const [innerDisplay, setInnerDisplay] = useState<Display>();
    // Audio Settings
    const [music, setMusic] = useState<number>();
    const [sound, setSound] = useState<number>();
    const [ambient, setAmbient] = useState<number>();
    const [uiSound, setUiSound] = useState<number>();
    // Extra Settings
    const [reducedMotion, setReducedMotion] = useState<boolean>();
    const [innerTheme, setInnerTheme] = useState<Theme>();

    useEffect(() => {
        (async () => {
            await settings.init();
            setMusic((await settings.get('music')) || 50);
            setSound((await settings.get('sound')) || 50);
            setUiSound((await settings.get('uiSound')) || 50);
            setAmbient((await settings.get('ambient')) || 50);

            setFastInteraction(checkBoolean(await settings.get('fastInteractions')));
            setSkipIntro(checkBoolean(await settings.get('skipIntro')));

            setRenderQuality((await settings.get('renderQuality')) || 'normal');
            setInnerDisplay((await settings.get('display'))!);
            setFpsLimit((await settings.get('fpsLimit')) || 60);
            setFpsLock(checkBoolean(await settings.get('fpsLock')));

            setReducedMotion(checkBoolean(await settings.get('reducedMotion')));
            setInnerTheme((await settings.get('theme'))!);

            toast.info('Settings loaded');
        })();
    }, []);

    const checkBoolean = (input: boolean | undefined): boolean => {
        if (input === undefined) return false;
        return input;
    };

    const normalizeInput = (val: string, min: number, max: number): number => {
        val.toString().startsWith('0');
        val.toString().replace('0', '');
        let num = Number(val);
        if (isNaN(num)) num = min;
        if (num > max) num = max;
        if (num < min) num = min;
        return num;
    };

    // #region Audio
    useEffect(() => {
        if (music === undefined) return;
        settings.set('music', music);
        settingsChanged();
    }, [music]);

    useEffect(() => {
        if (sound === undefined) return;
        settings.set('sound', sound);
        settingsChanged();
    }, [sound]);

    useEffect(() => {
        if (ambient === undefined) return;
        settings.set('ambient', ambient);
        settingsChanged();
    }, [ambient]);

    useEffect(() => {
        if (uiSound === undefined) return;
        settings.set('uiSound', uiSound);
        settingsChanged();
    }, [uiSound]);
    // #endregion

    // #region Extras
    useEffect(() => {
        if (reducedMotion === undefined) return;
        settings.set('reducedMotion', reducedMotion);
        settingsChanged();
    }, [reducedMotion]);
    // #endregion

    // #region Video
    useEffect(() => {
        if (fpsLimit === undefined) return;
        settings.set('fpsLimit', fpsLimit);
        settingsChanged();
    }, [fpsLimit]);

    useEffect(() => {
        if (fpsLock === undefined) return;
        settings.set('fpsLock', fpsLock);
        settingsChanged();
    }, [fpsLock]);

    useEffect(() => {
        if (renderQuality === undefined) return;
        settings.set('renderQuality', renderQuality);
        settingsChanged();
    }, [renderQuality]);
    // #endregion Video

    // #region Game
    useEffect(() => {
        if (fastInteraction === undefined) return;
        settings.set('fastInteraction', fastInteraction);
        settingsChanged();
    }, [fastInteraction]);

    useEffect(() => {
        if (skipIntro === undefined) return;
        settings.set('skipIntro', skipIntro);
        settingsChanged();
    }, [skipIntro]);
    // #endregion Game

    /*
    useEffect(() => {
        if (x === undefined) return;
        settings.set('x', x);
        settingsChanged();
    }, [x]);
    */

    return (
        <div className="SettingsPopup">
            <div>
                <nav className={openMenu}>
                    <li onClick={() => setOpenMenu('game')}>Game</li>
                    <li onClick={() => setOpenMenu('video')}>Video</li>
                    <li onClick={() => setOpenMenu('audio')}>Audio</li>
                    <li onClick={() => setOpenMenu('extras')}>Extras</li>
                </nav>
                {openMenu === 'game' && (
                    <div className="fields">
                        <div className="fast-interactions">
                            <div>Fast interactions (dice roll, movement, etc.):</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={fastInteraction}
                                    onChange={(e) => setFastInteraction(e.target.checked)}
                                />
                            </div>
                        </div>
                        <div className="skip-intro">
                            <div>Skip Intro (Glass break effect):</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={skipIntro}
                                    onChange={(e) => setSkipIntro(e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {openMenu === 'video' && (
                    <div className="fields">
                        <div className="Display">
                            Display:
                            <select
                                value={innerDisplay}
                                onChange={(e) => {
                                    setDisplay(e.target.value as Display);
                                    setInnerDisplay(e.target.value as Display);
                                }}
                            >
                                <option value={'fullscreen'}>Fullscreen</option>
                                <option value={'windowed fullscreen'}>Windowed Fullscreen</option>
                                <option value={'windowed'}>Windowed</option>
                            </select>
                        </div>
                        <div className="framerate toggle">
                            <div>Lock framerate:</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={fpsLock}
                                    onChange={(e) => setFpsLock(e.target.checked)}
                                />
                            </div>
                        </div>
                        <div className="framerate">
                            <div>FPS:</div>
                            <div>
                                <input
                                    disabled={!fpsLock}
                                    type="text"
                                    value={fpsLimit ?? 360}
                                    onChange={(e) => {
                                        setFpsLimit(normalizeInput(e.target.value, 10, 360));
                                    }}
                                />
                                <input
                                    disabled={!fpsLock}
                                    value={fpsLimit ?? 360}
                                    onChange={(e) => setFpsLimit(Number(e.target.value))}
                                    type="range"
                                    min="10"
                                    max="360"
                                />
                            </div>
                        </div>
                        <div className="render-quality">
                            Render Quality:
                            <select
                                value={renderQuality}
                                onChange={(e) => setRenderQuality(e.target.value as QualityLevels)}
                            >
                                <option value={'system'}>Low</option>
                                <option value={'dark'}>Normal</option>
                                <option value={'light'}>High</option>
                            </select>
                        </div>
                    </div>
                )}
                {openMenu === 'extras' && (
                    <div className="fields">
                        <div className="theme">
                            Theme:
                            <select
                                value={innerTheme}
                                onChange={(e) => {
                                    setTheme(e.target.value as Theme);
                                    setInnerTheme(e.target.value as Theme);
                                }}
                            >
                                <option value={'system'}>System</option>
                                <option value={'dark'}>Dark</option>
                                <option value={'light'}>Light</option>
                            </select>
                        </div>
                        <div className="motion">
                            Reduced Motion:
                            <div>
                                <input
                                    type="checkbox"
                                    checked={reducedMotion}
                                    onChange={(e) => setReducedMotion(e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {openMenu === 'audio' && (
                    <div className="fields">
                        <div className="sounds">
                            <div>Sounds:</div>
                            <div>
                                <input
                                    type="text"
                                    value={sound}
                                    onChange={(e) => {
                                        setSound(normalizeInput(e.target.value, 0, 100));
                                    }}
                                />
                                %
                                <input
                                    value={sound}
                                    onChange={(e) => setSound(Number(e.target.value))}
                                    type="range"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                        <div className="ambient">
                            <div>Ambient:</div>
                            <div>
                                <input
                                    type="text"
                                    value={ambient}
                                    onChange={(e) => {
                                        setAmbient(normalizeInput(e.target.value, 0, 100));
                                    }}
                                />
                                %
                                <input
                                    value={ambient}
                                    onChange={(e) => setAmbient(Number(e.target.value))}
                                    type="range"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                        <div className="music">
                            Music:
                            <div>
                                <input
                                    type="text"
                                    value={music}
                                    onChange={(e) => {
                                        setMusic(normalizeInput(e.target.value, 0, 100));
                                    }}
                                />
                                %
                                <input
                                    value={music}
                                    onChange={(e) => setMusic(Number(e.target.value))}
                                    type="range"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                        <div className="ui-sound">
                            <div>UI Sound:</div>
                            <div>
                                <input
                                    type="text"
                                    value={uiSound}
                                    onChange={(e) => {
                                        setUiSound(normalizeInput(e.target.value, 0, 100));
                                    }}
                                />
                                %
                                <input
                                    value={uiSound}
                                    onChange={(e) => setUiSound(Number(e.target.value))}
                                    type="range"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <button className="cancel-btn" onClick={closePopup}>
                Back
            </button>
        </div>
    );
};

export default SettingsPopup;
