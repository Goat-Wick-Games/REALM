import React, { useState } from "react";
import MainMenu from "./ui/MainMenu";
import ZoomScreen from "./ui/ZoomScreen";

type Screen = "zoom" | "tavern" | "menu";

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("menu"); // set back to zoom for production

  const handleVideoEnd = () => {
    if (screen === "zoom") setScreen("tavern");
    else if (screen === "tavern") setScreen("menu");
  };

  return (
    <main>
      {screen === "zoom" && <ZoomScreen onVideoEnd={handleVideoEnd} />}

      {screen === "tavern" && (
        <video
          src="/assets/tavern.mp4"
          autoPlay
          muted
          onEnded={handleVideoEnd}
          onClick={handleVideoEnd}
        />
      )}

      {screen === "menu" && <MainMenu />}
    </main>
  );
};

export default App;
