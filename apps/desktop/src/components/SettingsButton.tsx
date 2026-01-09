import React, { useState } from "react";
import "./SettingsButton.css";

const SettingsButton: React.FC = () => {
  const [confirm, setConfirm] = useState(false);

  const toggle = () => setConfirm((prev) => (prev ? false : true));

  return (
    <div className="SettingsButton">
      <button
        title="Settings for the game, the client and the inner works"
        className="Settings-btn"
        onClick={toggle}
      >
        Settings
      </button>

      {confirm && (
        <div className="Settings-popup">
          <h2>Settings</h2>
          <div className="fields">
            Theme: dark
            <br />
            Save Location: here
            <br />
            Sounds: 100%
            <br />
            Music:50%
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsButton;
