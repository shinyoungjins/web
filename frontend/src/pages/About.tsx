
import "../styles/About.css";

export default function About() {
    return (
        <section className="about-page">
            <div className="about-header">
                <h1>회사소개</h1>
                <p>좋은 고기, 좋은 식탁, 더 나은 일상</p>
            </div>

            <div className="about-content">
                {/* 회사소개 왼쪽 이미지 */}
                <div className="about-image">
                    <img
                        src="/images/about/about-beef.png"
                        alt="전문 정육사가 소고기를 손질하는 모습"
                    />
                </div>

                {/* 회사소개 오른쪽 내용 */}
                <div className="about-text">
                    <h2>신선함과 품질을 최우선으로 생각합니다.</h2>

                    <p>
                        저희는 고객님께 신선하고 품질 좋은 소고기를
                        합리적인 가격으로 제공하기 위해 노력하고 있습니다.
                    </p>

                    <p>
                        엄선된 한우부터 국내산 소고기, 수입산 소고기까지
                        다양한 상품을 준비하여 고객님의 식탁에
                        특별한 즐거움을 전해드립니다.
                    </p>

                    <p>
                        언제나 믿고 구매할 수 있는 쇼핑몰이 되도록
                        정직한 품질과 신뢰를 바탕으로 성장하겠습니다.
                    </p>

                    <div className="about-message">
                        <strong>
                            좋은 고기의 기준, 저희가 만들어가겠습니다.
                        </strong>
                    </div>
                </div>
            </div>
        </section>
    );
}
