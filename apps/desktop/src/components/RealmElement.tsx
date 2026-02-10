import { useEffect, useState } from 'react';
import './RealmElement.css';

type RealmElementProps = {
    realmList: Realm[];
    selectedRealm: (newRealm: boolean, realm?: Realm) => void;
};

const RealmElement: React.FC<RealmElementProps> = (props) => {
    const { realmList, selectedRealm } = props;
    const [name, setName] = useState<string>('');
    const [filteredRealms, setFilteredRealms] = useState<Realm[]>([]);

    useEffect(() => {
        if (!realmList) {
            setFilteredRealms([]); // safety
            return;
        }

        realmList.sort(
            (a, b) => new Date(a.lastPlayed).getTime() - new Date(b.lastPlayed).getTime(),
        );

        if (!name.trim()) {
            setFilteredRealms(realmList);
            return;
        }

        // Escape regex special realms
        const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedName, 'i');

        setFilteredRealms(
            realmList
                .filter((char) => regex.test(char.name))
                .sort(
                    (a, b) => new Date(a.lastPlayed).getTime() - new Date(b.lastPlayed).getTime(),
                ),
        );
    }, [name, realmList]);

    return (
        <main className="RealmSelect">
            <div className="Panel">
                <section className="Header">
                    <h2>
                        Realm Name:
                        <input
                            type="text"
                            name="Search"
                            id="Search"
                            className="Search"
                            placeholder="Pandora, Vinland etc."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </h2>
                </section>
                <div className="PanelInner">
                    <button onClick={() => selectedRealm(true)} className="Slot">
                        <div className="Info">
                            <span className="Name">Add new Realm</span>
                        </div>
                    </button>
                    {filteredRealms.map((realm) => (
                        <button
                            onClick={() => selectedRealm(true, realm)}
                            key={realm.id}
                            className="Slot"
                        >
                            <div className="Info">
                                <span className="Name">{realm.name}</span>
                                <div className="Meta">
                                    <span>
                                        Created: {new Date(realm.createdAt).toLocaleDateString()}
                                    </span>
                                    <span>
                                        Last Played:{' '}
                                        {realm.lastPlayed === 'never' ||
                                        realm.lastPlayed === null ||
                                        realm.lastPlayed === undefined
                                            ? 'never'
                                            : new Date(realm.lastPlayed).toLocaleDateString()}
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

export default RealmElement;
