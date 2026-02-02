import './Card.css';

const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    onClick,
    className = '',
    animated = true,
    ...props
}) => {
    const classes = [
        'card',
        `card-${variant}`,
        `card-padding-${padding}`,
        onClick && 'card-clickable',
        animated && 'card-animated',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
