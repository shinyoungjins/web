
import { useState } from "react";
import "../styles/Home.css";
import productPlaceholder from "../assets/product-placeholder.png";

interface Product {
    id: number;
    name: string;
    price: number | null;
    image: string;
}

const products: Product[] = [
    { id: 1, name: "한우 등심", price: null, image: productPlaceholder },
    { id: 2, name: "한우 안심", price: null, image: productPlaceholder },
    { id: 3, name: "한우 안창살", price: null, image: productPlaceholder },
    { id: 4, name: "한우 살치살", price: null, image: productPlaceholder },
    { id: 5, name: "한우 부채살", price: null, image: productPlaceholder },
    { id: 6, name: "한우 차돌박이", price: null, image: productPlaceholder },
];

const VISIBLE_COUNT = 4;

export default function Home() {
    const [startIndex, setStartIndex] = useState(0);

    // 다음 상품
    const nextProducts = () => {
        setStartIndex((prev) => (prev + 1) % products.length);
    };

    // 이전 상품
    const previousProducts = () => {
        setStartIndex(
            (prev) => (prev - 1 + products.length) % products.length
        );
    };

    // 현재 보여줄 상품 4개
    const visibleProducts = Array.from(
        { length: Math.min(VISIBLE_COUNT, products.length) },
        (_, index) => products[(startIndex + index) % products.length]
    );

    // 상품 상세 페이지 이동
    const handleProductClick = (id: number) => {
        window.location.href = `/products/${id}`;
    };

    return (
        <main className="home">
            <section className="product-section">

                <div className="product-heading">
                    <h2>BEST PRODUCTS</h2>
                    <p>엄선된 프리미엄 정육 상품을 만나보세요.</p>
                </div>

                <div className="product-carousel">

                    <button
                        type="button"
                        className="product-arrow product-prev"
                        onClick={previousProducts}
                        aria-label="이전 상품"
                    >
                        &#10094;
                    </button>

                    <div className="product-grid">
                        {visibleProducts.map((product) => (
                            <div
                                key={product.id}
                                className="product-card"
                                role="link"
                                tabIndex={0}
                                onClick={() => handleProductClick(product.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleProductClick(product.id);
                                    }
                                }}
                            >
                                <div className="product-image">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                    />
                                </div>

                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-price">
                                        {product.price !== null
                                            ? `${product.price.toLocaleString()}원`
                                            : "가격 준비 중"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="product-arrow product-next"
                        onClick={nextProducts}
                        aria-label="다음 상품"
                    >
                        &#10095;
                    </button>

                </div>
            </section>
        </main>
    );
}
