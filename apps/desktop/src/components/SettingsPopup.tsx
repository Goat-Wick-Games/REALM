import { useEffect, useRef, useState } from 'react';
import { AppStore } from '../storage';
import { useTheme, type Theme } from '../theme/ThemeContext';
import type { Display } from '../display';
import { setDisplay } from '../display';
import { toast } from 'react-toastify';

type SettingsPopupProps = {
    closePopup: () => void;
};

const SettingsPopup: React.FC<SettingsPopupProps> = (props) => {
    const settings = useRef(new AppStore('settings.json')).current;
    const { setTheme } = useTheme();
    const { closePopup } = props;
    const [music, setMusic] = useState<number>();
    const [sound, setSound] = useState<number>();
    const [innerTheme, setInnerTheme] = useState<Theme>();
    const [innerDisplay, setInnerDisplay] = useState<Display>();

    useEffect(() => {
        (async () => {
            await settings.init();
            setMusic((await settings.get('music')) || 50);
            setSound((await settings.get('sound')) || 75);
            setInnerTheme((await settings.get('theme'))!);
            setInnerDisplay((await settings.get('display'))!);
            toast.info('Settings loaded');
        })();
    }, []);

    useEffect(() => {
        settings.set('music', music);
    }, [music]);

    useEffect(() => {
        settings.set('sound', sound);
    }, [sound]);

    return (
        <div className="Popup settings">
            <h2>Settings</h2>
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
                <div className="saveloc">
                    <div>Save Location:</div>
                    <code> FileService </code>
                </div>
                <div className="sounds">
                    <div>Sounds:</div>
                    <div>
                        <input
                            type="text"
                            min="0"
                            max="100"
                            value={sound}
                            onChange={(e) => {
                                let val = e.target.value;
                                val.toString().startsWith('0');
                                val.toString().replace('0', '');
                                let num = Number(val);
                                if (isNaN(num)) num = 0;
                                if (num > 1000) num = 1000;
                                if (num < 0) num = 0;
                                setSound(num);
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
                <div className="music">
                    Music:
                    <div>
                        <input
                            type="text"
                            min="0"
                            max="100"
                            value={music}
                            onChange={(e) => {
                                let val = e.target.value;
                                val.toString().startsWith('0');
                                val.toString().replace('0', '');
                                let num = Number(val);
                                if (isNaN(num)) num = 0;
                                if (num > 1000) num = 1000;
                                if (num < 0) num = 0;
                                setMusic(num);
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
            </div>
            <button className="cancel-btn" onClick={closePopup}>
                Back
            </button>
        </div>
    );
};

export default SettingsPopup;
