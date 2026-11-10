
import '../styles/Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h2>대광축산</h2>
                        <p>믿을 수 있는 축산물 유통</p>
                    </div>

                    <div className="footer-details">
                        <div className="footer-line">
                            <span>대표 홍길동</span>
                            <span>사업자등록번호 000-00-00000</span>
                            <span>서울특별시 ○○구 ○○로 00</span>
                        </div>

                        <div className="footer-line">
                            <span>대표전화 02-000-0000</span>
                            <span>info@example.com</span>
                            <span>평일 09:00 ~ 18:00</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    © {new Date().getFullYear()} DAEGWANG LIVESTOCK.
                    All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
