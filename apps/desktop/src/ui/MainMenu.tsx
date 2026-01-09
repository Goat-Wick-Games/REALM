import ExitButton from "../components/ExitButton"; // wherever you put your exit function
import React from "react";
import "./MainMenu.css";

type MainMenuProps = {};

const MainMenu: React.FC<MainMenuProps> = () => {
  return (
    <main className="MainMenu">
      <div className="Overlay">
        <h1>
          RE<span className="Slash">/\</span>LM
        </h1>
        <button disabled title="Start a campaign first">
          Continue
        </button>
        <button disabled title="Work in Progress">
          Tutorial
        </button>
        <button title="Host a Realm for you and your friends to enjoy with you being the Realmkeeper">
          Host Realm
        </button>
        <button title="Join a Realm where your friend is the Realmkeeper and roleplay together">
          Join Realm
        </button>
        <button title="Create a brand new Realm you can play with your friends">
          Create Realm
        </button>
        <button title="Create a brand new character you can play in others realms">
          Create Character
        </button>
        <button title="Settings for the game, the client and the inner works">
          Settings
        </button>
        <ExitButton />
      </div>
    </main>
  );
};

export default MainMenu;
