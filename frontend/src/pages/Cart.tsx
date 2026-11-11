
import { useEffect, useState } from "react";
import {
    getCartList,
    updateCartQuantity,
    deleteCart
} from "../api/cartApi";
import type { CartItem } from "../api/cartApi";
import productPlaceholder from "../assets/product-placeholder.png";
import "../styles/Cart.css";

// 장바구니 페이지
export default function Cart() {
    // 장바구니 상품 목록
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // 로딩 및 처리 상태
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    // 장바구니 목록 조회
    const loadCart = async () => {
        try {
            setError("");
            const data = await getCartList();
            setCartItems(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "장바구니 조회 중 오류가 발생했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCart();
    }, []);

    // 수량 변경
    const handleQuantityChange = async (cartId: number, quantity: number) => {
        if (quantity < 1 || processingId !== null) {
            return;
        }

        setProcessingId(cartId);

        try {
            await updateCartQuantity(cartId, quantity);
            await loadCart();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "수량 변경에 실패했습니다."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // 장바구니 상품 삭제
    const handleDelete = async (cartId: number) => {
        if (processingId !== null) {
            return;
        }

        if (!window.confirm("장바구니에서 상품을 삭제하시겠습니까?")) {
            return;
        }

        setProcessingId(cartId);

        try {
            await deleteCart(cartId);
            await loadCart();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "상품 삭제에 실패했습니다."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // 전체 상품 금액
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.totalPrice ?? 0),
        0
    );

    // 전체 상품 수량
    const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    // 장바구니 조회 중
    if (loading) {
        return (
            <main className="cart-page">
                장바구니를 불러오는 중입니다.
            </main>
        );
    }

    // 장바구니 조회 실패
    if (error) {
        return (
            <main className="cart-page">
                {error}
            </main>
        );
    }

    return (
        <main className="cart-page">
            {/* 장바구니 제목 */}
            <h1>장바구니</h1>

            {/* 장바구니가 비어 있는 경우 */}
            {cartItems.length === 0 ? (
                <div className="cart-empty">
                    <p>장바구니에 담긴 상품이 없습니다.</p>

                    <button
                        type="button"
                        onClick={() => window.location.href = "/"}
                    >
                        쇼핑 계속하기
                    </button>
                </div>
            ) : (
                <>
                    {/* 장바구니 상품 목록 */}
                    <div className="cart-list">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.cartId}>

                                {/* 상품 이미지 */}
                                <div className="cart-item-image">
                                    <img
                                        src={item.productImage || productPlaceholder}
                                        alt={item.productName}
                                    />
                                </div>

                                {/* 상품 정보 */}
                                <div className="cart-item-info">
                                    <h3>{item.productName}</h3>

                                    <p>
                                        중량: {item.weightGram / 1000}kg
                                    </p>

                                    <p>
                                        상품 단가:{" "}
                                        {item.unitPrice?.toLocaleString() ?? "-"}원
                                    </p>
                                </div>

                                {/* 수량 변경 */}
                                <div className="cart-item-quantity">
                                    <button
                                        type="button"
                                        disabled={processingId !== null || item.quantity <= 1}
                                        onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                                    >
                                        −
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        type="button"
                                        disabled={processingId !== null}
                                        onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* 상품별 총 금액 */}
                                <strong className="cart-item-price">
                                    {item.totalPrice?.toLocaleString() ?? "-"}원
                                </strong>

                                {/* 상품 삭제 */}
                                <button
                                    type="button"
                                    className="cart-item-delete"
                                    disabled={processingId !== null}
                                    onClick={() => handleDelete(item.cartId)}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 주문 예정 금액 */}
                    <div className="cart-summary">
                        <h2>주문 예정 금액</h2>

                        <div>
                            <span>총 상품 수량</span>
                            <strong>{totalQuantity}개</strong>
                        </div>

                        <div>
                            <span>총 상품 금액</span>
                            <strong>{totalPrice.toLocaleString()}원</strong>
                        </div>

                        <p>배송비는 주문 단계에서 계산됩니다.</p>

                        <button
                            type="button"
                            onClick={() => alert("주문 기능은 추후 구현할 예정입니다.")}
                        >
                            주문하기
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}
