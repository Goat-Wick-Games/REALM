import { useEffect, useRef, useState } from 'react';
import './CharacterSelect.css';
import type { Character } from '@realm/core';
import { CharacterStore } from '@realm/storage';

type CharacterSelectProps = {
    characterList: Character[];
    closePopup: (selected?: Character | null, exit?: boolean) => void;
    deleteCharacter: (id: number) => void;
    importCharacter: () => void;
};

const CharacterSelect: React.FC<CharacterSelectProps> = (props) => {
    const charactersStore = useRef(new CharacterStore()).current;

    const { characterList, closePopup, deleteCharacter, importCharacter } = props;
    const [name, setName] = useState<string>('');
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character>();
    const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);

    useEffect(() => {
        const initStore = async () => {
            await charactersStore.init();
        };
        initStore();
        if (!characterList) {
            setFilteredCharacters([]); // safety
            return;
        }

        characterList.sort(
            (a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime(),
        );

        if (!name.trim()) {
            setFilteredCharacters(characterList);
            return;
        }

        // Escape regex special characters
        const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedName, 'i');

        setFilteredCharacters(
            characterList
                .filter(
                    (char) =>
                        regex.test(char.name) || regex.test(char.class) || regex.test(char.race),
                )
                .sort(
                    (a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime(),
                ),
        );
    }, [name, characterList]);

    return (
        <main className="CharacterSelect">
            {showPopup && (
                <div className="ConfirmPopup">
                    <h1>Are you sure you want to delete {selectedCharacter?.name}</h1>
                    <p>This action can not be undone (unless character is first exported)</p>
                    <div className="popup-buttons">
                        <button
                            className="confirm-btn"
                            onClick={() => {
                                if (!selectedCharacter) return setShowPopup(false);
                                deleteCharacter(selectedCharacter?.id ?? -1);
                            }}
                        >
                            Yes
                        </button>
                        <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                            No
                        </button>
                    </div>
                </div>
            )}
            <div className="Panel">
                <section className="Header">
                    <button onClick={() => closePopup(null, true)} className="Close">
                        X
                    </button>
                    <h2>
                        Name, Race or Class:
                        <input
                            type="text"
                            name="Search"
                            id="Search"
                            className="Search"
                            placeholder="Human, Barbarian etc."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </h2>
                </section>
                <div className="PanelInner">
                    <button onClick={() => closePopup()} className="Slot">
                        <span className="Avatar Add">+</span>
                        <div className="Info">
                            <span className="Name">Add new Character</span>
                        </div>
                    </button>
                    <button onClick={importCharacter} className="Slot">
                        <span className="Avatar Add">↧</span>
                        <div className="Info">
                            <span className="Name">Import Character/Characters</span>
                        </div>
                    </button>
                    {filteredCharacters.map((character) => (
                        <button
                            onClick={() => closePopup(character)}
                            key={character.id}
                            className="Slot"
                        >
                            <div
                                className="Delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCharacter(character);
                                    setShowPopup(true);
                                }}
                            >
                                🗑
                            </div>
                            <img
                                src={`/characters/icons/${character.race && character.class ? `${character.race}/${character.race}-${character.class}` : 'none'}.svg`}
                                className="Avatar"
                                alt="Avatar"
                            />

                            <div className="Info">
                                <span className="Name">
                                    {character.name}
                                    <br />

                                    <span>
                                        {character.race} - {character.class}
                                    </span>
                                </span>
                                <div className="Meta">
                                    <span>
                                        Created:{' '}
                                        {new Date(character.createdAt).toLocaleDateString()}
                                    </span>
                                    <span>
                                        Last Played:{' '}
                                        {character.lastPlayed === 'never' ||
                                        character.lastPlayed === null ||
                                        character.lastPlayed === undefined
                                            ? 'never'
                                            : new Date(character.lastPlayed).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default CharacterSelect;
