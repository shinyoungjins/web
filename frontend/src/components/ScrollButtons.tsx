
import "../styles/ScrollButtons.css";

export default function ScrollButtons() {

    // 페이지 최상단 이동
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // 페이지 최하단 이동
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth"
        });
    };

    return (
        <div className="scroll-buttons">
            <button
                type="button"
                className="scroll-button"
                onClick={scrollToTop}
                aria-label="페이지 최상단 이동"
            >
                <span className="scroll-icon">⌃</span>
                <span>TOP</span>
            </button>

            <button
                type="button"
                className="scroll-button"
                onClick={scrollToBottom}
                aria-label="페이지 최하단 이동"
            >
                <span>BOTTOM</span>
                <span className="scroll-icon">⌄</span>
            </button>
        </div>
    );
}
