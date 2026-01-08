import React, { useEffect, useState } from "react";
import "./ZoomScreen.css";

type ZoomScreenProps = {
  onVideoEnd: () => void;
};

const ZoomScreen: React.FC<ZoomScreenProps> = (props: ZoomScreenProps) => {
  const { onVideoEnd: handleVideoEnd } = props;
  const [splashScreen, setSplashScreen] = useState<boolean>(false);

  useEffect(() => {
    const handleKey = () => setSplashScreen(true);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <video
        src="/assets/zoom.mp4"
        autoPlay
        muted
        onEnded={() => setSplashScreen(true)}
      />
      {splashScreen && (
        <img
          className="splashScreen"
          src="/assets/splashscreen.png"
          alt="Splash Screen"
          onClick={handleVideoEnd}
          onKeyDown={handleVideoEnd}
        />
      )}
    </>
  );
};

export default ZoomScreen;
