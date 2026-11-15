import { loadDisplay } from './display';
import ScreenRouter from './router/ScreenRouter';
import { ToastContainer, Zoom } from 'react-toastify';
import { useTheme } from './context/ThemeContext';
import { useSettings } from './context/SettingsContext';
import { FpsOverlay } from './components/FpsOverlay';
import { useEffect } from 'react';

const App: React.FC = () => {
    const { theme } = useTheme();
    const { settings, loaded } = useSettings();

    useEffect(() => {
        loadDisplay();
    }, []);
    return (
        <>
            <ScreenRouter />
            <FpsOverlay enabled={loaded && settings.showFps} />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                limit={3}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
                transition={Zoom}
            />
        </>
    );
};

export default App;
