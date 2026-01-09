import { useState } from "react";
import type { Screen } from "../types/screen";
import IntroSmash from "../screens/IntroSmash";
import MainMenu from "../ui/MainMenu";

const ScreenRouter: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("boot");
  const [showMainMenu, setShowMainMenu] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  switch (screen) {
    case "boot":
      return (
        <>
          {showIntro && (
            <IntroSmash
              onDone={() => {
                setShowMainMenu(true);
                setTimeout(() => setShowIntro(false), 1000);
                setScreen;
              }}
            />
          )}
          {showMainMenu && <MainMenu />}
        </>
      );
    default:
      return null;
  }
};

export default ScreenRouter;
