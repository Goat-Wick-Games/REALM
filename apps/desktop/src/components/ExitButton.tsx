import React, { useState } from "react";
import "./ExitButton.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

const ExitButton: React.FC = () => {
  const [confirm, setConfirm] = useState(false);

  const handleExit = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  };

  const handleCancel = () => setConfirm(false);

  return (
    <div className="ExitButton">
      <button
        title="Leave the application"
        className="exit-btn"
        onClick={() => setConfirm(true)}
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
