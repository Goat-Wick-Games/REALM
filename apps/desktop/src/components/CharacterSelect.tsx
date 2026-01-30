import './CharacterSelect.css';

type CharacterSelectProps = {
    characterList: Character[];
    closePopup: (selected?: Character) => void;
};

const CharacterSelect: React.FC<CharacterSelectProps> = (props) => {
    const { characterList, closePopup } = props;
    return (
        <main className="CharacterSelect">
            <button onClick={() => closePopup()} className="Close">
                X
            </button>
            <div className="Panel">
                <button onClick={() => closePopup()} className="Slot">
                    <span className="Avatar Add">+</span>
                    <div className="Info">
                        <span className="Name">Add new Character</span>
                    </div>
                </button>
                {characterList.map((character) => (
                    <button
                        onClick={() => closePopup(character)}
                        key={character.id}
                        className="Slot"
                    >
                        <img
                            src={'/ui/default-character.png'}
                            alt={character.name}
                            className="Avatar"
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
                                    Created: {new Date(character.createdAt).toLocaleDateString()}
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
        </main>
    );
};

export default CharacterSelect;
