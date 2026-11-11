
import { useEffect, useState } from "react";
import {
    getProductList,
    calculateProductPrice,
} from "../api/productApi";
import type { Product } from "../api/productApi";

import productPlaceholder from "../assets/product-placeholder.png";
import "../styles/ProductSlider.css";

const VISIBLE_COUNT = 4;
const DEFAULT_WEIGHT = 200;

export default function ProductSlider() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getProductList();
                setProducts(data);
            } catch (error) {
                console.error("상품 조회 실패:", error);
            }
        };

        loadProducts();
    }, []);

    const maxIndex = Math.max(0, products.length - VISIBLE_COUNT);

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    const visibleProducts = products.slice(
        currentIndex,
        currentIndex + VISIBLE_COUNT
    );

    const getOriginName = (originCd: string | null) => {
        switch (originCd) {
            case "KR":
                return "국내산";
            case "US":
                return "미국산";
            case "AU":
                return "호주산";
            default:
                return "원산지 미등록";
        }
    };

    return (
        <section className="product-section">
            <div className="product-section-header">
                <h2>추천 상품</h2>
                <p>신선하고 품질 좋은 소고기를 만나보세요.</p>
            </div>

            <div className="product-slider">
                <button
                    type="button"
                    className="product-arrow product-arrow-left"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    aria-label="이전 상품"
                >
                    &#10094;
                </button>

                <div className="product-grid">
                    {visibleProducts.map((product) => {
                        const price200g =
                            product.pricePerKg !== null
                                ? calculateProductPrice(
                                    product.pricePerKg,
                                    DEFAULT_WEIGHT
                                )
                                : null;

                        return (
                            <a
                                href={`/products/${product.productId}`}
                                className="product-card"
                                key={product.productId}
                            >
                                <div className="product-image">
                                    <img
                                        src={product.productImage || productPlaceholder}
                                        alt={product.productName}
                                    />
                                </div>

                                <div className="product-info">
                                    <div className="product-origin">
                                        {getOriginName(product.originCd)}
                                        {product.hanwooYn === "Y" && " · 한우"}
                                    </div>

                                    <h3 className="product-name">
                                        {product.productName}
                                    </h3>

                                    <div className="product-price">
                                        {price200g !== null
                                            ? `${price200g.toLocaleString()}원`
                                            : "가격 문의"}
                                    </div>

                                    <div className="product-weight">
                                        {DEFAULT_WEIGHT}g 기준
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="product-arrow product-arrow-right"
                    onClick={handleNext}
                    disabled={currentIndex >= maxIndex}
                    aria-label="다음 상품"
                >
                    &#10095;
                </button>
            </div>
        </section>
    );
}
