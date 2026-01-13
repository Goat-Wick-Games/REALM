import { useTheme } from '../theme/ThemeContext';
import './ManageCharacter.css';

type ManageCharacterProps = {
    onBack: () => void;
};

const ManageCharacter: React.FC<ManageCharacterProps> = (props) => {
    const { onBack } = props;
    const { theme } = useTheme();

    const handleMouseMove = (e: React.MouseEvent) => {
        const { innerWidth, innerHeight } = window;

        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2 * -1;

        // update CSS variables
        const bg = document.querySelector('.MenuBackground') as HTMLElement;
        bg.style.setProperty('--wall-x', `${x * 5 * (16 / 9)}px`);
        bg.style.setProperty('--wall-y', `${y * 5}px`);
    };

    return (
        <main className="ManageCharacter" onMouseMove={(e) => handleMouseMove(e)}>
            <button className={`back-btn ${theme}`} onClick={onBack}>
                ←
            </button>
            <div className="Topbar">
                <h1 className="Title">
                    RE<span className="Slash">/\</span>LM
                </h1>
            </div>
            <div className="MenuBackground">
                <img src={`/bg/wall-${theme}.svg`} className="bg layer-wall" />
                <img src={`/bg/floor-${theme}.svg`} className="bg layer-wall" />
                <img src={`/bg/stand-${theme}.svg`} className="bg layer-wall" />
            </div>
        </main>
    );
};

export default ManageCharacter;
