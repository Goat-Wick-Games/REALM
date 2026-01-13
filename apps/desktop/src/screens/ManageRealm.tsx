import './ManageRealm.css';

type ManageRealmProps = {
    onBack: () => void;
};

const ManageRealm: React.FC<ManageRealmProps> = (props) => {
    const { onBack } = props;
    return (
        <main>
            <button onClick={onBack}>Back</button>
            <div>fafasfsafsa</div>
        </main>
    );
};

export default ManageRealm;
