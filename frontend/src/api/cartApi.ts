
// 장바구니 상품 정보
export interface CartItem {
    cartId: number;
    memberId: number | null;
    guestId: string | null;
    productId: number;
    weightGram: number;
    quantity: number;
    productName: string;
    productImage: string | null;
    originCd: string | null;
    pricePerKg: number | null;
    unitPrice: number | null;
    totalPrice: number | null;
    createdAt: string;
    updatedAt: string;
}

// 장바구니 상품 추가 요청
export interface AddCartRequest {
    productId: number;
    weightGram: number;
    quantity: number;
}

// 장바구니 목록 조회
export async function getCartList(): Promise<CartItem[]> {
    const response = await fetch("/api/cart", {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("장바구니 목록 조회에 실패했습니다.");
    }

    return response.json();
}

// 장바구니 상품 추가
export async function addCart(request: AddCartRequest): Promise<void> {
    const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        throw new Error("장바구니 상품 추가에 실패했습니다.");
    }
}

// 장바구니 상품 수량 변경
export async function updateCartQuantity(cartId: number, quantity: number): Promise<void> {
    const response = await fetch(`/api/cart/${cartId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
        throw new Error("장바구니 수량 변경에 실패했습니다.");
    }
}

// 장바구니 상품 삭제
export async function deleteCart(cartId: number): Promise<void> {
    const response = await fetch(`/api/cart/${cartId}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("장바구니 상품 삭제에 실패했습니다.");
    }
}
