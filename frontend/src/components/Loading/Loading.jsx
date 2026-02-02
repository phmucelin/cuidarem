import './Loading.css';

const Loading = ({ size = 'md', fullScreen = false, text }) => {
    if (fullScreen) {
        return (
            <div className="loading-fullscreen">
                <div className="loading-content">
                    <div className="loading-heart">
                        <svg viewBox="0 0 100 100" className="heart-svg">
                            <path
                                className="heart-path"
                                d="M50 88.9l-5.5-5C18.5 60.2 2 45.4 2 27.2 2 12.4 13.8.6 28.6.6c8.4 0 16.5 3.9 21.4 10.1C54.9 4.5 63 .6 71.4.6 86.2.6 98 12.4 98 27.2c0 18.2-16.5 33-42.5 56.7L50 88.9z"
                            />
                        </svg>
                    </div>
                    {text && <p className="loading-text">{text}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className={`loading-spinner loading-${size}`}>
            <div className="spinner-ring" />
        </div>
    );
};

export default Loading;
