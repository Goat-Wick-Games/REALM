import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import './ManageCharacter.css';
import type { Character, Races, Classes } from '@realm/core';
import { toast } from 'react-toastify';
import basicData from '@realm/content';
import CharacterSelect from '../components/CharacterSelect';
import { SettingsStore } from '@realm/storage';
import { CharacterStore } from '@realm/storage';

type ManageCharacterProps = {
    onBack: () => void;
};

const ManageCharacter: React.FC<ManageCharacterProps> = (props) => {
    const { onBack } = props;

    const bobFrame = useRef<number>(0);
    const bobStart = useRef<number>(performance.now());
    const containerRef = useRef<HTMLElement | null>(null);
    const charactersStore = useRef(new CharacterStore()).current;

    const [reducedMotion, setReducedMotion] = useState<boolean>(true);
    const settings = useRef(new SettingsStore('settings.json')).current;
    const { theme } = useTheme();

    const [showSelect, setShowSelect] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [look, setLook] = useState<string>('none');
    const [bio, setBio] = useState<string>('');
    const [age, setAge] = useState<number>(0);

    const [characterList, setCharacterList] = useState<Character[]>([]);
    const [character, setCharacter] = useState<Character>();
    const [$class, set$Class] = useState<Classes>();
    const [race, setRace] = useState<Races>();
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
            setReducedMotion((await settings.get('reducedMotion')) || false);
        })();
    }, []);

    useEffect(() => {
        if (!character) return;

        setName(character.name ?? '');
        setAge(character.age ?? 0);
        setBio(character.bio ?? '');
        setRace(character.race ?? null);
        set$Class(character.class ?? null);
    }, [character]);

    useEffect(() => {
        const raceTraits = race ? basicData.characterBases[race].traits : undefined;
        const classTraits = $class ? basicData.classBases[$class].traits : undefined;

        const totalTraits = {
            Reflexes: (raceTraits?.Reflexes ?? 0) + (classTraits?.Reflexes ?? 0),
            Endurance: (raceTraits?.Endurance ?? 0) + (classTraits?.Endurance ?? 0),
            Acumen: (raceTraits?.Acumen ?? 0) + (classTraits?.Acumen ?? 0),
            Legerity: (raceTraits?.Legerity ?? 0) + (classTraits?.Legerity ?? 0),
            Magnetism: (raceTraits?.Magnetism ?? 0) + (classTraits?.Magnetism ?? 0),
        };

        setTraits(totalTraits);
        setLook(race && $class ? `${race}-${$class}` : 'none');
        if (!$class) setLook(race ? `${race}-base` : 'none');
    }, [race, $class]);

    useEffect(() => {
        if (!character) setAge(0);
    }, [race]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (reducedMotion) return;
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = containerRef.current;
        bg?.style.setProperty('--wall-x', `${x * 4 * (16 / 9)}px`);
        bg?.style.setProperty('--wall-y', `${y * 4}px`);

        bg?.style.setProperty('--wall-2-x', `${x * 6 * (16 / 9)}px`);
        bg?.style.setProperty('--wall-2-y', `${y * 6}px`);

        bg?.style.setProperty('--char-x', `${x * 6 * (16 / 9) + 200}px`);
    };

    useEffect(() => {
        if (reducedMotion) return;

        const amplitude = 50; // how high it moves (px)
        const speed = 1 / 1000; // lower = slower

        const animate = (time: number) => {
            if (!containerRef.current) return;

            const elapsed = time - bobStart.current;
            const offset = Math.sin(elapsed * speed) * amplitude;

            containerRef.current.style.setProperty('--char-y', `${offset}px`);

            bobFrame.current = requestAnimationFrame(animate);
        };

        bobFrame.current = requestAnimationFrame(animate);

        return () => {
            if (bobFrame.current) cancelAnimationFrame(bobFrame.current);
        };
    }, [reducedMotion]);

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

    const exportCharacter = async () => {
        if (!character) toast.error('No Character Selected (how?)');
        if (!race) toast.error('Select their race');
        if (!$class) toast.error('Select their class');
        if (!name) toast.error('Give them a name');
        if (!character || !name || !race || !$class) return;

        await charactersStore.exportToJSON(character.id);
        const updatedList = await charactersStore.getAll();
        clearSheet();
        setCharacterList(updatedList);
    };

    const importCharacter = async () => {
        const imported = await charactersStore.importFromJSON();
        if (!imported.result)
            return toast.error(`Could not import character reason: ${imported.reason}`);
        if (imported.character === undefined) return;
        toast.info(imported.reason);
        const chars = await charactersStore.getAll();
        setCharacterList(chars);
        const importedCharacter = imported.character;
        const character = chars.find(
            (c) =>
                c.name === importedCharacter.name &&
                c.bio === importedCharacter.bio &&
                c.class === importedCharacter.class &&
                c.race === importedCharacter.race,
        );
        setCharacter(character);
    };

    const deleteCharacter = async (id: number) => {
        const success = await charactersStore.deleteCharacter(id);
        if (!success) return toast.error('Could not delete character');
        toast.info('Character deleted successfully');
        const chars = await charactersStore.getAll();
        setCharacterList(chars);
        setShowSelect(false);
        console.log(character?.id);
        console.log(id);
        if (character?.id === id) clearSheet();
    };

    const editCharacter = async () => {
        if (!character) toast.error('No Character Selected (how?)');
        if (!race) toast.error('Select their race');
        if (!$class) toast.error('Select their class');
        if (!name) toast.error('Give them a name');
        if (!character || !name || !race || !$class) return;

        await charactersStore.update(
            character.id,
            name,
            $class,
            race,
            age === Number.POSITIVE_INFINITY ? -1 : age,
            bio,
        );
        const updatedList = await charactersStore.getAll();
        clearSheet();
        setCharacterList(updatedList);
    };

    const saveCharacter = async () => {
        if (!race) toast.error('Select their race');
        if (!$class) toast.error('Select their class');
        if (!name) toast.error('Give them a name');
        if (!name || !race || !$class) return;

        await charactersStore.add(
            name,
            $class,
            race,
            age === Number.POSITIVE_INFINITY ? -1 : age,
            bio,
        );
        const updatedList = await charactersStore.getAll();
        clearSheet();
        setCharacterList(updatedList);
    };

    return (
        <main
            ref={containerRef}
            className="ManageCharacter"
            onMouseMove={(e) => handleMouseMove(e)}
        >
            <button className="BackBtn" onClick={onBack}>
                ←
            </button>
            <div className="Topbar">
                <h1 className="Title">
                    CHAR<span className="Slash">/\</span>CTERS
                </h1>
            </div>
            <div className="MenuBackground">
                <img src={`/bg/wall-${theme}.svg`} alt="MenuWall" className="bg layer-wall" />
                <img src={`/bg/wall-${theme}-2.svg`} alt="MenuWall2" className="bg layer-wall-2" />
                <img src={`/bg/floor-${theme}.svg`} alt="MenuFloor" className="bg layer-wall-2" />
                <img src={`/bg/stand-${theme}.svg`} alt="MenuStand" className="bg layer-wall-2" />
                <img
                    src={`/characters/${theme}/${race ? `${race}/` : ''}${look}.svg`}
                    alt="CharacterLooks"
                    className="bg CharacterLooks"
                />
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
                            value={age === -1 ? Number.POSITIVE_INFINITY : age}
                            onChange={(e) => {
                                const maxValue = race ? basicData.characterBases[race].maxAge : 0;
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
                            {Object.entries(basicData.characterBases).map((race, i) => (
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
                            {Object.entries(basicData.classBases).map(($class, i) => (
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
                        <div className="Control">
                            <button className="SaveButton" onClick={saveCharacter}>
                                Save
                            </button>
                            <button className="SaveButton" onClick={importCharacter}>
                                Import
                            </button>
                        </div>
                    ) : (
                        <div className="Control">
                            <button className="SaveButton" onClick={editCharacter}>
                                Edit
                            </button>
                            <button className="SaveButton" onClick={exportCharacter}>
                                Export
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="CharSelect">
                <button name="Character" onClick={() => setShowSelect(true)}>
                    Select Character
                </button>
            </div>
            {showSelect && (
                <CharacterSelect
                    characterList={characterList}
                    closePopup={(character, exit) => {
                        !character ? !exit && clearSheet() : setCharacter(character);
                        setShowSelect(false);
                    }}
                    deleteCharacter={deleteCharacter}
                    importCharacter={importCharacter}
                />
            )}
        </main>
    );
};

export default ManageCharacter;
