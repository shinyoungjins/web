
import { useEffect, useState } from "react";
import { getProductDetail, calculateProductPrice } from "../api/productApi";
import { addCart } from "../api/cartApi";
import type { Product } from "../api/productApi";
import productPlaceholder from "../assets/product-placeholder.png";
import "../styles/ProductDetail.css";

// 선택 가능한 상품 중량(kg)
const WEIGHT_OPTIONS = [1, 5, 10];

// 원산지 코드에 따른 원산지명 반환
function getOriginName(originCd: string | null) {
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

export default function ProductDetail() {

    // 상품 정보
    const [product, setProduct] = useState<Product | null>(null);

    // 선택 중량(kg)
    const [weight, setWeight] = useState(1);

    // 선택 수량
    const [quantity, setQuantity] = useState(1);

    // 조회 및 장바구니 처리 상태
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState("");

    // URL에서 상품 ID 추출
    const productId = Number(
        window.location.pathname.split("/").filter(Boolean).pop()
    );

    // 상품 상세 정보 조회
    useEffect(() => {
        let cancelled = false;

        const loadProduct = async () => {
            setLoading(true);
            setError("");

            if (!Number.isSafeInteger(productId) || productId <= 0) {
                setError("잘못된 상품 주소입니다.");
                setLoading(false);
                return;
            }

            try {
                const data = await getProductDetail(productId);

                if (!cancelled) {
                    setProduct(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "상품 정보를 불러오지 못했습니다."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [productId]);

    // 선택 중량 기준 상품 단가 계산
    const unitPrice =
        product?.pricePerKg != null
            ? calculateProductPrice(product.pricePerKg, weight * 1000)
            : null;

    // 선택 수량을 반영한 총 상품 금액
    const totalPrice =
        unitPrice !== null
            ? unitPrice * quantity
            : null;

    // 총 주문 중량(kg)
    const totalWeight = weight * quantity;

    // 수량 감소
    const decreaseQuantity = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    // 수량 증가
    const increaseQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    // 장바구니 상품 추가
    const handleAddToCart = async () => {
        if (!product || addingToCart || totalPrice === null) {
            return;
        }

        setAddingToCart(true);

        try {
            // kg을 g으로 변환하여 서버에 전달
            await addCart({
                productId: product.productId,
                weightGram: weight * 1000,
                quantity: quantity
            });

            // 장바구니 등록 성공 안내
            const moveToCart = window.confirm(
                "장바구니에 상품을 담았습니다.\n장바구니로 이동하시겠습니까?"
            );

            if (moveToCart) {
                // 장바구니 페이지 구현 후 연결할 주소
                window.location.href = "/cart";
            }
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "장바구니 상품 추가 중 오류가 발생했습니다."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    // 바로 구매하기 (추후 구현)
    const handleBuyNow = () => {
        alert("구매 기능은 추후 연결할 예정입니다.");
    };

    // 상품 조회 중
    if (loading) {
        return (
            <div className="product-detail-message">
                상품 정보를 불러오는 중입니다.
            </div>
        );
    }

    // 상품 조회 실패
    if (error || !product) {
        return (
            <div className="product-detail-message">
                {error || "상품을 찾을 수 없습니다."}
            </div>
        );
    }

    return (
        <section className="product-detail">
            {/* 상품 이미지 */}
            <div className="product-detail-image">
                <img
                    src={product.productImage || productPlaceholder}
                    alt={product.productName}
                />
            </div>

            {/* 상품 상세 정보 */}
            <div className="product-detail-info">

                {/* 원산지 및 한우 여부 */}
                <div className="product-detail-origin">
                    {getOriginName(product.originCd)}
                    {product.hanwooYn === "Y" && " · 한우"}
                </div>

                {/* 상품명 */}
                <h1 className="product-detail-name">
                    {product.productName}
                </h1>

                {/* 상품 설명 */}
                {product.productDesc && (
                    <p className="product-detail-description">
                        {product.productDesc}
                    </p>
                )}

                <div className="product-detail-divider" />

                {/* 상품 기본 정보 */}
                <div className="product-detail-row">
                    <span>1kg 기준 가격</span>
                    <strong>
                        {product.pricePerKg != null
                            ? `${product.pricePerKg.toLocaleString()}원`
                            : "가격 문의"}
                    </strong>
                </div>

                <div className="product-detail-row">
                    <span>원산지</span>
                    <strong>{getOriginName(product.originCd)}</strong>
                </div>

                <div className="product-detail-divider" />

                {/* 중량 선택 */}
                <div className="product-detail-option">
                    <label htmlFor="product-weight">
                        중량 선택
                    </label>

                    <select
                        id="product-weight"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                    >
                        {WEIGHT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}kg
                            </option>
                        ))}
                    </select>
                </div>

                {/* 수량 선택 */}
                <div className="product-detail-option">
                    <span>수량 선택</span>

                    <div className="product-detail-quantity">
                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1}
                            aria-label="수량 감소"
                        >
                            −
                        </button>

                        <span>{quantity}</span>

                        <button
                            type="button"
                            onClick={increaseQuantity}
                            aria-label="수량 증가"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="product-detail-divider" />

                {/* 총 상품 금액 */}
                <div className="product-detail-total">
                    <span>총 상품 금액</span>

                    <strong>
                        {totalPrice !== null
                            ? `${totalPrice.toLocaleString()}원`
                            : "가격 문의"}
                    </strong>
                </div>

                {/* 선택 중량 및 수량 */}
                <p className="product-detail-summary">
                    {weight}kg × {quantity}개 (총 {totalWeight}kg)
                </p>

                {/* 구매 버튼 */}
                <div className="product-detail-actions">
                    <button
                        type="button"
                        className="product-detail-cart"
                        onClick={handleAddToCart}
                        disabled={totalPrice === null || addingToCart}
                    >
                        {addingToCart ? "담는 중..." : "장바구니"}
                    </button>

                    <button
                        type="button"
                        className="product-detail-buy"
                        onClick={handleBuyNow}
                        disabled={totalPrice === null}
                    >
                        구매하기
                    </button>
                </div>
            </div>
        </section>
    );
}
