import React from 'react';
import './DangoButton.css';

const DangoButton = ({ text, onClick, type = 'primary', disabled = false }) => {
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