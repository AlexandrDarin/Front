import React from 'react';
import './Input.scss';

const Input = ({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <input
                type={type}
                className={`input-field ${error ? 'input-field--error' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                {...props}
            />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
};

export default Input;