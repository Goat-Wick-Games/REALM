import './ExitPopup.css';

type ExitPopupProps = {
    closePopup: () => void;
    exitApp: () => void;
};

const ExitPopup: React.FC<ExitPopupProps> = (props) => {
    const { closePopup, exitApp } = props;

    return (
        <div className="ExitPopup">
            <p>Are you sure you want to exit?</p>
            <div className="popup-buttons">
                <button className="confirm-btn" onClick={exitApp}>
                    Yes
                </button>
                <button className="cancel-btn" onClick={closePopup}>
                    No
                </button>
            </div>
        </div>
    );
};

export default ExitPopup;
