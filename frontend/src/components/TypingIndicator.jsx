export default function TypingIndicator({ message = 'Analyzing your symptoms…' }) {
    return (
        <div className="typing-indicator">
            <div className="typing-dots">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
            </div>
            <span className="typing-text">{message}</span>
        </div>
    )
}
