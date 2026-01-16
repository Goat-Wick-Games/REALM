import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import './ManageCharacter.css';
import races from '../fix-data/character-bases.json';
import classes from '../fix-data/class-bases.json';
import { CharactersStore } from '../characters';

const charactersStore = new CharactersStore();

type ManageCharacterProps = {
    onBack: () => void;
};

const ManageCharacter: React.FC<ManageCharacterProps> = (props) => {
    const [characterList, setCharacterList] = useState<Character[]>();
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<number>(0);
    const [bio, setBio] = useState<string>('');
    const [race, setRace] = useState<Races>();
    const [$class, set$Class] = useState<Classes>();
    const [traits, setTraits] = useState({
        Reflexes: 0,
        Endurance: 0,
        Acumen: 0,
        Legerity: 0,
        Magnetism: 0,
    });
    const { onBack } = props;
    const { theme } = useTheme();

    useEffect(() => {
        const initStore = async () => {
            await charactersStore.init();
            const chars = await charactersStore.getAll();
            setCharacterList(chars);
        };
        initStore();
    }, []);

    useEffect(() => {
        const raceTraits = race ? races[race].traits : undefined;
        const classTraits = $class ? classes[$class].traits : undefined;

        const totalTraits = {
            Reflexes: (raceTraits?.Reflexes ?? 0) + (classTraits?.Reflexes ?? 0),
            Endurance: (raceTraits?.Endurance ?? 0) + (classTraits?.Endurance ?? 0),
            Acumen: (raceTraits?.Acumen ?? 0) + (classTraits?.Acumen ?? 0),
            Legerity: (raceTraits?.Legerity ?? 0) + (classTraits?.Legerity ?? 0),
            Magnetism: (raceTraits?.Magnetism ?? 0) + (classTraits?.Magnetism ?? 0),
        };

        setTraits(totalTraits);
    }, [race, $class]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = document.querySelector('.MenuBackground') as HTMLElement;
        bg.style.setProperty('--wall-x', `${x * 5 * (16 / 9)}px`);
        bg.style.setProperty('--wall-y', `${y * 5}px`);
    };

    const capitalizeFirstLetter = (text: string): string =>
        text ? text.replace(text[0], text[0].toString().toUpperCase()) : '';

    const saveCharacter = async () => {
        if (!race) console.error('Select their race');
        if (!$class) console.error('Select their class');
        if (!name) console.error('Give them a name');
        if (!name || !race || !$class) return;

        const newChar: Character = {
            id: `c${
                characterList && characterList.length > 0
                    ? Math.max(...characterList.map((c) => parseInt(c.id.slice(1)))) + 1
                    : 0
            }`,
            name,
            race,
            class: $class,
            age: age === Number.POSITIVE_INFINITY ? -1 : age,
            bio,
            createdAt: new Date().toISOString(),
        };

        await charactersStore.add(newChar);
        const updatedList = await charactersStore.getAll();
        setCharacterList(updatedList);
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
                    <div className="CharAge">
                        <label htmlFor="CharAge">Age:</label>
                        <input
                            type="text"
                            name="CharAge"
                            id="CharAge"
                            placeholder="Age..."
                            className="CharacterAge"
                            value={age}
                            onChange={(e) => {
                                const maxValue = race ? races[race].maxAge : 0;
                                let val = e.target.value;
                                if (val.startsWith('0')) val = val.replace('0', '');
                                val = val.replace('-', '');

                                let num = Number(val);
                                if (isNaN(num)) num = 0;
                                if (maxValue === -1) {
                                    if (num > 99999999) num = Number.POSITIVE_INFINITY;
                                    else if (num < 0) num = 0;
                                } else if (num > maxValue) num = maxValue;
                                else if (num < 0) num = 0;
                                setAge(num);
                            }}
                        />
                    </div>
                    <div className="CharBio">
                        <p>Bio:</p>
                        <textarea
                            name="CharBio"
                            id="CharBio"
                            placeholder="Bio..."
                            className="CharacterBio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>
                    <div className="CharInfo">
                        <select
                            onChange={(e) => setRace(e.target.value as Races)}
                            name="CharRace"
                            id="Race"
                        >
                            <option hidden>Choose Race</option>
                            {Object.entries(races).map((race, i) => (
                                <option key={i} value={race[0]}>
                                    {capitalizeFirstLetter(race[0])}
                                </option>
                            ))}
                        </select>
                        <select
                            name="CharClass"
                            id="Class"
                            onChange={(e) => set$Class(e.target.value as Classes)}
                        >
                            <option hidden>Choose Class</option>
                            {Object.entries(classes).map(($class, i) => (
                                <option key={i} value={$class[0]}>
                                    {capitalizeFirstLetter($class[0])}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="REALM">
                        <div className="Reflexes">
                            Reflexes: <span>{traits.Reflexes}</span>
                        </div>
                        <div className="Endurance">
                            Endurance: <span>{traits.Endurance}</span>
                        </div>
                        <div className="Acumen">
                            Acumen: <span>{traits.Acumen}</span>
                        </div>
                        <div className="Legerity">
                            Legerity: <span>{traits.Legerity}</span>
                        </div>
                        <div className="Magnetism">
                            Magnetism: <span>{traits.Magnetism}</span>
                        </div>
                    </div>
                    <button className="SaveButton" onClick={saveCharacter}>
                        Save
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ManageCharacter;
