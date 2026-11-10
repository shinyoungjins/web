
import Header from './components/Header';
import Home from './pages/Home';
import Footer from './components/Footer';
import Slideshow from './components/Slideshow';
import ScrollButtons from './components/ScrollButtons';
import './App.css';

function App() {
    return (
        <div className="app-layout">
            <Header />

            <section className="main-banner">
                <div className="banner-left">
                    <Slideshow />
                </div>

                <div className="banner-right">
                    <h2>LOGIN</h2>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            placeholder="아이디"
                            aria-label="아이디"
                        />

                        <input
                            type="password"
                            placeholder="비밀번호"
                            aria-label="비밀번호"
                        />

                        <button type="submit">
                            로그인
                        </button>
                    </form>

                    <div className="login-links">
                        <a href="#signup">회원가입</a>
                        <span>|</span>
                        <a href="#find-account">계정 찾기</a>
                    </div>
                </div>
            </section>

            <Home />
            <Footer />
            <ScrollButtons />
        </div>
    );
}

export default App;
