import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import './ManageCharacter.css';
import races from '../fix-data/character-bases.json';
import classes from '../fix-data/class-bases.json';
import { CharactersStore } from '../characters';
import { toast } from 'react-toastify';
import CharacterSelect from '../components/CharacterSelect';
import { AppStore } from '../storage';

type ManageCharacterProps = {
    onBack: () => void;
};

const ManageCharacter: React.FC<ManageCharacterProps> = (props) => {
    const { onBack } = props;
    const { theme } = useTheme();
    const charactersStore = useRef(new CharactersStore()).current;
    const settings = useRef(new AppStore('settings.json')).current;
    const [reducedMotion, setReducedMotion] = useState<boolean>();

    const [characterList, setCharacterList] = useState<Character[]>([]);
    const [character, setCharacter] = useState<Character>();
    const [showSelect, setShowSelect] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<number>(0);
    const [look, setLook] = useState<Looks>({ head: 'none', legs: 'none', torso: 'none' });
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

    useEffect(() => {
        const initStore = async () => {
            await charactersStore.init();
            const chars = await charactersStore.getAll();
            setCharacterList(chars);
        };
        initStore();
    }, []);

    useEffect(() => {
        (async () => {
            await settings.init();
            setReducedMotion(await settings.get('reducedMotion'));
        })();
    }, []);

    useEffect(() => loadCharacter(), [character]);

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

    useEffect(() => setAge(0), [race]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (reducedMotion) return;
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = document.querySelector('.MenuBackground') as HTMLElement;
        bg.style.setProperty('--wall-x', `${x * 4 * (16 / 9)}px`);
        bg.style.setProperty('--wall-y', `${y * 4}px`);

        bg.style.setProperty('--wall-2-x', `${x * 6 * (16 / 9)}px`);
        bg.style.setProperty('--wall-2-y', `${y * 6}px`);
    };

    const capitalizeFirstLetter = (text: string): string =>
        text ? text.replace(text[0], text[0].toString().toUpperCase()) : '';

    const clearSheet = () => {
        setCharacter(undefined);
        setName('');
        setAge(0);
        setBio('');
        setRace('');
        set$Class('');
        setTraits({
            Reflexes: 0,
            Endurance: 0,
            Acumen: 0,
            Legerity: 0,
            Magnetism: 0,
        });
    };

    const loadCharacter = () => {
        if (!characterList) return;

        setName(character?.name ?? '');
        setAge(character?.age ?? 0);
        setBio(character?.bio ?? '');
        setRace(character?.race ?? '');
        set$Class(character?.class ?? '');
    };

    const editCharacter = async () => {
        if (!race) toast.error('Select their race');
        if (!$class) toast.error('Select their class');
        if (!name) toast.error('Give them a name');
        if (!name || !race || !$class) return;
        if (!look.head || !look.legs || !look.torso) return toast.error('Give them a look');
        if (look.head === 'none' || look.legs === 'none' || look.torso === 'none')
            return toast.error('Give them a look');

        const newChar: Partial<Character> = {
            name,
            age: age === Number.POSITIVE_INFINITY ? -1 : age,
            bio,
            race,
            class: $class,
        };

        await charactersStore.update(character!.id, newChar);
        const updatedList = await charactersStore.getAll();
        clearSheet();
        setCharacterList(updatedList);
    };

    const saveCharacter = async () => {
        if (!race) toast.error('Select their race');
        if (!$class) toast.error('Select their class');
        if (!name) toast.error('Give them a name');
        if (!name || !race || !$class) return;
        if (!look.head || !look.legs || !look.torso) return toast.error('Give them a look');
        if (look.head === 'none' || look.legs === 'none' || look.torso === 'none')
            return toast.error('Give them a look');

        const date: string = new Date().toISOString();
        const charId = await charactersStore.getMaxId();

        const newChar: Character = {
            id: `c${charId.toString().padStart(2, '0')}`,
            name,
            race,
            class: $class,
            age: age === Number.POSITIVE_INFINITY ? -1 : age,
            bio,
            createdAt: date,
            lastPlayed: 'never',
            looks: look,
        };

        await charactersStore.add(newChar);
        const updatedList = await charactersStore.getAll();
        clearSheet();
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
                <img src={`/bg/wall-${theme}-2.svg`} className="bg layer-wall-2" />
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
                            value={race}
                            onChange={(e) => setRace(e.target.value as Races)}
                            name="CharRace"
                            id="Race"
                        >
                            <option value="" hidden>
                                Choose Race
                            </option>
                            {Object.entries(races).map((race, i) => (
                                <option key={i} value={race[0]}>
                                    {capitalizeFirstLetter(race[0])}
                                </option>
                            ))}
                        </select>
                        <select
                            value={$class}
                            name="CharClass"
                            id="Class"
                            onChange={(e) => set$Class(e.target.value as Classes)}
                        >
                            <option value="" hidden>
                                Choose Class
                            </option>
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
                    {!character ? (
                        <button className="SaveButton" onClick={saveCharacter}>
                            Save
                        </button>
                    ) : (
                        <button className="SaveButton" onClick={editCharacter}>
                            Edit
                        </button>
                    )}
                </div>
            </div>
            <div className="CharArrows L">
                <img src={`/ui/arrow-${theme}.svg`} className="ArrowL" alt="Arrow" />
                <img src={`/ui/arrow-${theme}.svg`} className="ArrowL" alt="Arrow" />
                <img src={`/ui/arrow-${theme}.svg`} className="ArrowL" alt="Arrow" />
            </div>
            <div className="CharLooks">
                <img
                    src={`/characters/${character?.looks.head ?? 'none'}-${theme}.svg`}
                    className="Head"
                    alt="Head"
                />
                <img
                    src={`/characters/${character?.looks.torso ?? 'none'}-${theme}.svg`}
                    className="Torso"
                    alt="Torso"
                />
                <img
                    src={`/characters/${character?.looks.legs ?? 'none'}-${theme}.svg`}
                    className="Legs"
                    alt="Legs"
                />
            </div>
            <div className="CharArrows R">
                <img src={`/ui/arrow-${theme}.svg`} className="ArrowR" alt="Arrow" />
                <img src={`/ui/arrow-${theme}.svg`} className="ArrowR" alt="Arrow" />
                <img src={`/ui/arrow-${theme}.svg`} className="ArrowR" alt="Arrow" />
            </div>
            <div className="CharSelect">
                <button name="Character" onClick={() => setShowSelect(true)}>
                    Select Character
                </button>
            </div>
            {showSelect && (
                <CharacterSelect
                    characterList={characterList}
                    closePopup={(character) => {
                        setCharacter(character);
                        setShowSelect(false);
                    }}
                />
            )}
        </main>
    );
};

export default ManageCharacter;
