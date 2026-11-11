
import { useEffect, useState } from "react";
import {
    getProductList,
    calculateProductPrice,
} from "../api/productApi";
import type {
    Product,
    ProductCategory,
} from "../api/productApi";

import "../styles/ProductList.css";

const DEFAULT_WEIGHT = 200;

const CATEGORY_NAMES: Record<ProductCategory, string> = {
    all: "전체상품",
    hanwoo: "한우",
    domestic: "국내산 소고기",
    imported: "수입산 소고기",
    us: "미국산 소고기",
    au: "호주산 소고기",
    wagyu: "와규",
};

const VALID_CATEGORIES = Object.keys(
    CATEGORY_NAMES
) as ProductCategory[];

function getCategoryFromUrl(): ProductCategory {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (
        category &&
        VALID_CATEGORIES.includes(category as ProductCategory)
    ) {
        return category as ProductCategory;
    }

    return "all";
}

function getOriginName(originCd: string | null): string {
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
}

export default function ProductList() {
    const [category, setCategory] = useState<ProductCategory>(
        getCategoryFromUrl
    );
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const handlePopState = () => {
            setCategory(getCategoryFromUrl());
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getProductList(category);

                if (!cancelled) {
                    setProducts(data);
                }
            } catch (err) {
                console.error("상품 조회 실패:", err);

                if (!cancelled) {
                    setError("상품 목록을 불러오지 못했습니다.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, [category]);

    return (
        <section className="product-section product-list-page">
            <div className="product-section-header">
                <h2>{CATEGORY_NAMES[category]}</h2>
                <p>신선하고 품질 좋은 소고기를 만나보세요.</p>
            </div>

            {loading ? (
                <p>상품을 불러오는 중입니다.</p>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : products.length === 0 ? (
                <p>등록된 상품이 없습니다.</p>
            ) : (
                <div className="product-grid">
                    {products.map((product) => {
                        const price =
                            product.pricePerKg !== null
                                ? calculateProductPrice(
                                    product.pricePerKg,
                                    DEFAULT_WEIGHT
                                )
                                : null;

                        return (
                            <a
                                key={product.productId}
                                href={`/products/${product.productId}`}
                                className="product-card"
                            >
                                <div className="product-image">
                                    <img
                                        src={
                                            product.productImage ||
                                            "/product-placeholder.png"
                                        }
                                        alt={product.productName}
                                        loading="lazy"
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
                                        {price !== null
                                            ? `${price.toLocaleString()}원`
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
            )}
        </section>
    );
}
