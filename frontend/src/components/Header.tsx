
import mainMark from '../assets/mainMark.png';
import '../styles/Header.css';

function Header() {
    return (
        <header>
            <a href="/" className="header-home-link">
                <img
                    src={mainMark}
                    alt="DG Logo"
                    className="header-logo"
                />
            </a>
        </header>
    );
}

export default Header;
