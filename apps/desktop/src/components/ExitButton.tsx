import React, { useState } from "react";
import { ipcRenderer } from "electron";
import "./ExitButton.css";

const ExitButton: React.FC = () => {
  const [confirm, setConfirm] = useState(false);

  const handleExit = async () => {
    await ipcRenderer.invoke("exit-app");
  };

  const handleCancel = () => setConfirm(false);

  return (
    <div className="exit-button-container">
      <button
        title="Leave the application"
        className="exit-btn"
        onClick={handleExit}
      >
        Exit
      </button>

      {confirm && (
        <div className="exit-popup">
          <p>Are you sure you want to exit?</p>
          <div className="popup-buttons">
            <button className="confirm-btn" onClick={handleExit}>
              Yes
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitButton;
