import React from 'react';
import './Button.scss';

const Button = ({ 
    children, 
    type = 'button', 
    variant = 'primary', 
    size = 'medium',
    onClick, 
    disabled = false,
    fullWidth = false,
    className = '',
    ...props 
}) => {
    const buttonClasses = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full-width' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;