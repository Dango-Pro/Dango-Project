import './DangoButton.css';

interface DangoButtonProps {
    text: string;
    onClick: () => void;
    type?: string;
    disabled?: boolean;
}

const DangoButton = ({ text, onClick, type = 'primary', disabled = false }: DangoButtonProps) => {
    return (
        <button
            className={`dango-btn ${type}`}
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

export default DangoButton;