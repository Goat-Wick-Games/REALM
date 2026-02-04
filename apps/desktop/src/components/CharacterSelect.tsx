import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import './CharacterSelect.css';

type CharacterSelectProps = {
    characterList: Character[];
    closePopup: (selected?: Character) => void;
};

const CharacterSelect: React.FC<CharacterSelectProps> = (props) => {
    const { characterList, closePopup } = props;
    const { theme } = useTheme();
    const [name, setName] = useState<string>('');
    const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);

    useEffect(() => {
        if (!characterList) {
            setFilteredCharacters([]); // safety
            return;
        }

        if (!name.trim()) {
            setFilteredCharacters(characterList);
            return;
        }

        // Escape regex special characters
        const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedName, 'i');

        setFilteredCharacters(
            characterList.filter(
                (char) => regex.test(char.name) || regex.test(char.class) || regex.test(char.race),
            ),
        );
    }, [name, characterList]);

    return (
        <main className="CharacterSelect">
            <div className="Panel">
                <section className="Header">
                    <button onClick={() => closePopup()} className="Close">
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
                    {filteredCharacters.map((character) => (
                        <button
                            onClick={() => closePopup(character)}
                            key={character.id}
                            className="Slot"
                        >
                            <img
                                src={`/characters/${character?.looks.head ?? 'none'}-${theme}.svg`}
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
