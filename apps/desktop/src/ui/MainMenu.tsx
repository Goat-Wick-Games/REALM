import React from "react";
import "./MainMenu.css";

type MainMenuProps = {};

const MainMenu: React.FC<MainMenuProps> = (props: MainMenuProps) => {
  return (
    <main className="MainMenu">
      <div className="overlay">
        <h1>Mythica</h1>
        <button disabled title="Start a campaign first">
          Continue
        </button>
        <button disabled title="Work in Progress">
          Tutorial
        </button>
        <button title="Host a campaign for you and your friends to enjoy with you being the Realmkeeper">
          Host Campaign
        </button>
        <button title="Join a campaign where your friend is the Realmkeeper and roleplay together">
          Join Campaign
        </button>
        <button title="Create a brand new campaign you can play with your friends">
          Create Campaign
        </button>
        <button title="Settings for the game, the client and the inner works">
          Settings
        </button>
        <button title="Leave the application">Exit</button>
      </div>
    </main>
  );
};

export default MainMenu;
