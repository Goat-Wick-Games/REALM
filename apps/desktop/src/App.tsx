import { loadDisplay } from './display';
import ScreenRouter from './router/ScreenRouter';
import { ToastContainer, Zoom } from 'react-toastify';
import { useTheme } from './theme/ThemeContext';

const App: React.FC = () => {
    const { theme } = useTheme();
    loadDisplay();
    return (
        <>
            <ScreenRouter />
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
