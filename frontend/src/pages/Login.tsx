
import "../styles/Login.css";

/**
 * 소셜 로그인 페이지
 *
 * 카카오, 네이버, 구글 로그인 지원
 */
export default function Login() {

    /**
     * 카카오 로그인
     *
     * Spring Security OAuth2 인증 페이지로 이동
     */
    const handleKakaoLogin = () => {
        window.location.href =
            "http://localhost:8080/oauth2/authorization/kakao";
    };

    /**
     * 네이버 로그인
     *
     * Spring Security OAuth2 인증 페이지로 이동
     */
    const handleNaverLogin = () => {
        window.location.href =
            "http://localhost:8080/oauth2/authorization/naver";
    };

    /**
     * 구글 로그인
     *
     * Spring Security OAuth2 인증 페이지로 이동
     */
    const handleGoogleLogin = () => {
        window.location.href =
            "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className="login-page">
            <div className="login-container">

                <h1 className="login-title">로그인</h1>

                <p className="login-description">
                    소셜 계정으로 간편하게 로그인하세요.
                </p>

                {/* 카카오 로그인 */}
                <button
                    type="button"
                    className="social-login-button kakao-login"
                    onClick={handleKakaoLogin}
                >
                    <span className="social-login-icon">●</span>
                    카카오로 시작하기
                </button>

                {/* 네이버 로그인 */}
                <button
                    type="button"
                    className="social-login-button naver-login"
                    onClick={handleNaverLogin}
                >
                    <span className="social-login-icon">N</span>
                    네이버로 시작하기
                </button>

                {/* 구글 로그인 */}
                <button
                    type="button"
                    className="social-login-button google-login"
                    onClick={handleGoogleLogin}
                >
                    <span className="social-login-icon">G</span>
                    Google로 시작하기
                </button>

            </div>
        </div>
    );
}
