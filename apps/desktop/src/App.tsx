import { loadDisplay } from './display';
import ScreenRouter from './router/ScreenRouter';

const App: React.FC = () => {
    loadDisplay();
    return <ScreenRouter />;
};

export default App;
