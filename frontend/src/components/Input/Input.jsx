import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    helperText,
    icon: Icon,
    required = false,
    disabled = false,
    fullWidth = true,
    className = '',
    ...props
}) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const classes = [
        'input-wrapper',
        fullWidth && 'input-full',
        focused && 'input-focused',
        error && 'input-error',
        disabled && 'input-disabled',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {label && (
                <label className="input-label" htmlFor={name}>
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-container">
                {Icon && <span className="input-icon"><Icon size={20} /></span>}
                <input
                    id={name}
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="input-field"
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="input-toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                )}
            </div>
            {(error || helperText) && (
                <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
};

export default Input;
