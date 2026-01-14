import { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import './ManageCharacter.css';

type ManageCharacterProps = {
    onBack: () => void;
};

const ManageCharacter: React.FC<ManageCharacterProps> = (props) => {
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<number>(Math.floor(Math.random() * 50));
    const { onBack } = props;
    const { theme } = useTheme();

    const handleMouseMove = (e: React.MouseEvent) => {
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = document.querySelector('.MenuBackground') as HTMLElement;
        bg.style.setProperty('--wall-x', `${x * 5 * (16 / 9)}px`);
        bg.style.setProperty('--wall-y', `${y * 5}px`);
    };

    return (
        <main className="ManageCharacter" onMouseMove={(e) => handleMouseMove(e)}>
            <button className={`back-btn ${theme}`} onClick={onBack}>
                ←
            </button>
            <div className="Topbar">
                <h1 className="Title">
                    RE<span className="Slash">/\</span>LM
                </h1>
            </div>
            <div className="MenuBackground">
                <img src={`/bg/wall-${theme}.svg`} className="bg layer-wall" />
                <img src={`/bg/floor-${theme}.svg`} className="bg layer-wall" />
                <img src={`/bg/stand-${theme}.svg`} className="bg layer-wall" />
            </div>
            <div className="CharacterStats">
                <div className="CharacterStatsInner">
                    <div className="CharName">
                        <input
                            type="text"
                            name="CharName"
                            id="CharName"
                            placeholder="Name..."
                            className="CharacterName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="CharInfo">
                        <select name="CharRace" id="">
                            <option value="Choose Race">Choose Race</option>
                        </select>
                        <input
                            type="number"
                            name="CharAge"
                            id="CharAge"
                            placeholder="Age..."
                            className="CharacterRace"
                            value={age}
                            onChange={(e) => {
                                let val = e.target.value;
                                val.toString().startsWith('0');
                                val.toString().replace('0', '');
                                let num = Number(val);
                                if (isNaN(num)) num = 0;
                                if (num > 1000) num = 1000;
                                if (num < 0) num = 0;
                                setAge(num);
                            }}
                        />
                    </div>
                    <div className="REALM">
                        <div className="Reflexes">
                            Reflexes: <span>20</span>
                        </div>
                        <div className="Endurance">
                            Endurance: <span>20</span>
                        </div>
                        <div className="Acumen">
                            Acumen: <span>20</span>
                        </div>
                        <div className="Legerity">
                            Legerity: <span>20</span>
                        </div>
                        <div className="Magnetism">
                            Magnetism: <span>20</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ManageCharacter;
