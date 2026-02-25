import { useState } from 'react';
import './MapCreatorPopup.css';

type MapCreatorPopupProps = {
    closePopup: () => void;
    mapCreated: (mapName: string) => void;
};

const MapCreatorPopup: React.FC<MapCreatorPopupProps> = (props) => {
    const { closePopup, mapCreated } = props;
    const [mapName, setMapName] = useState<string>('');

    return (
        <div className="MapCreatorPopup">
            <h2>Create New Map</h2>
            <input
                type="text"
                placeholder="Map Name"
                id="map-name-input"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
            />
            <div className="popup-buttons">
                <button
                    className="confirm-btn"
                    onClick={() => {
                        mapCreated(mapName);
                        closePopup();
                    }}
                >
                    Create
                </button>
                <button className="cancel-btn" onClick={closePopup}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default MapCreatorPopup;
