import { useState } from 'react';
import './SettingsPopup.css';
import { useTheme, type Theme } from '../context/ThemeContext';
import { type Display, setDisplay } from '../Display';
import { useSettings, type QualityLevels } from '../context/SettingsContext';

type SettingsPopupProps = {
    closePopup: () => void;
};

type MenuTypes = 'video' | 'audio' | 'extras' | 'game';

const SettingsPopup: React.FC<SettingsPopupProps> = ({ closePopup }) => {
    const { settings, updateSetting } = useSettings();
    const { setTheme } = useTheme();
    const [openMenu, setOpenMenu] = useState<MenuTypes>('game');

    const normalizeInput = (val: string, min: number, max: number) => {
        let num = Number(val);
        if (isNaN(num)) num = min;
        if (num > max) num = max;
        if (num < min) num = min;
        return num;
    };

    return (
        <div className="SettingsPopup">
            <div>
                <nav className={openMenu}>
                    <li onClick={() => setOpenMenu('game')}>Game</li>
                    <li onClick={() => setOpenMenu('video')}>Video</li>
                    <li onClick={() => setOpenMenu('audio')}>Audio</li>
                    <li onClick={() => setOpenMenu('extras')}>Extras</li>
                </nav>

                {/* Game */}
                {
                    // #region Game
                }
                {openMenu === 'game' && (
                    <div className="fields">
                        <div className="fast-interactions">
                            <div>Fast interactions (dice roll, movement, etc.):</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={settings.fastInteraction}
                                    onChange={(e) =>
                                        updateSetting('fastInteraction', e.target.checked)
                                    }
                                />
                            </div>
                        </div>
                        <div className="skip-intro">
                            <div>Skip Intro (Glass break effect):</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={settings.skipIntro}
                                    onChange={(e) => updateSetting('skipIntro', e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {
                    // #endregion Game
                }

                {/* Video */}
                {
                    // #region Video
                }
                {openMenu === 'video' && (
                    <div className="fields">
                        <div className="Display">
                            Display:
                            <select
                                value={settings.display}
                                onChange={(e) => {
                                    const val = e.target.value as Display;
                                    setDisplay(val);
                                    updateSetting('display', val);
                                }}
                            >
                                <option value="fullscreen">Fullscreen</option>
                                <option value="windowed fullscreen">Windowed Fullscreen</option>
                                <option value="windowed">Windowed</option>
                            </select>
                        </div>
                        <div className="framerate toggle">
                            <div>Lock framerate:</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={settings.fpsLock}
                                    onChange={(e) => updateSetting('fpsLock', e.target.checked)}
                                />
                            </div>
                        </div>
                        <div className="framerate">
                            <div>FPS:</div>
                            <div>
                                <input
                                    disabled={!settings.fpsLock}
                                    type="text"
                                    value={settings.fpsLimit ?? 60}
                                    onChange={(e) =>
                                        updateSetting(
                                            'fpsLimit',
                                            normalizeInput(e.target.value, 10, 360),
                                        )
                                    }
                                />
                                <input
                                    disabled={!settings.fpsLock}
                                    value={settings.fpsLimit ?? 60}
                                    type="range"
                                    min="10"
                                    max="360"
                                    onChange={(e) =>
                                        updateSetting('fpsLimit', Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>
                        <div className="render-quality">
                            Render Quality:
                            <select
                                value={settings.renderQuality}
                                onChange={(e) =>
                                    updateSetting('renderQuality', e.target.value as QualityLevels)
                                }
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                )}
                {
                    // #endregion Video
                }

                {/* Extras */}
                {
                    // #region Extras
                }
                {openMenu === 'extras' && (
                    <div className="fields">
                        <div className="theme">
                            Theme:
                            <select
                                value={settings.theme}
                                onChange={(e) => {
                                    const val = e.target.value as Theme;
                                    setTheme(val);
                                    updateSetting('theme', val);
                                }}
                            >
                                <option value="system">System</option>
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                        <div className="motion">
                            Reduced Motion:
                            <div>
                                <input
                                    type="checkbox"
                                    checked={settings.reducedMotion}
                                    onChange={(e) =>
                                        updateSetting('reducedMotion', e.target.checked)
                                    }
                                />
                            </div>
                        </div>
                        <div className="framerate toggle">
                            <div>Show FPS:</div>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={settings.showFps}
                                    onChange={(e) => updateSetting('showFps', e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {
                    // #endregion Extras
                }

                {/* Audio */}
                {
                    // #region Audio
                }
                {openMenu === 'audio' && (
                    <div className="fields">
                        <div className="sounds">
                            <div>Sounds:</div>
                            <div>
                                <input
                                    type="text"
                                    value={settings.sound}
                                    onChange={(e) =>
                                        updateSetting(
                                            'sound',
                                            normalizeInput(e.target.value, 0, 100),
                                        )
                                    }
                                />
                                %
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.sound}
                                    onChange={(e) => updateSetting('sound', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="ambient">
                            <div>Ambient:</div>
                            <div>
                                <input
                                    type="text"
                                    value={settings.ambient}
                                    onChange={(e) =>
                                        updateSetting(
                                            'ambient',
                                            normalizeInput(e.target.value, 0, 100),
                                        )
                                    }
                                />
                                %
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.ambient}
                                    onChange={(e) =>
                                        updateSetting('ambient', Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>

                        <div className="music">
                            <div>Music:</div>
                            <div>
                                <input
                                    type="text"
                                    value={settings.music}
                                    onChange={(e) =>
                                        updateSetting(
                                            'music',
                                            normalizeInput(e.target.value, 0, 100),
                                        )
                                    }
                                />
                                %
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.music}
                                    onChange={(e) => updateSetting('music', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="ui-sound">
                            <div>UI Sound:</div>
                            <div>
                                <input
                                    type="text"
                                    value={settings.uiSound}
                                    onChange={(e) =>
                                        updateSetting(
                                            'uiSound',
                                            normalizeInput(e.target.value, 0, 100),
                                        )
                                    }
                                />
                                %
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.uiSound}
                                    onChange={(e) =>
                                        updateSetting('uiSound', Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}
                {
                    //#endregion
                }
            </div>

            <button className="cancel-btn" onClick={closePopup}>
                Back
            </button>
        </div>
    );
};

export default SettingsPopup;
