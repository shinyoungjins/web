
export interface Product {
    // 상품 정보
    productId: number;
    productName: string;
    productDesc: string | null;
    productImage: string | null;
    productCategory: string;

    // 한우 여부 및 원산지
    hanwooYn: "Y" | "N";
    originCd: string | null;

    // 사용 여부
    useYn: "Y" | "N";

    // 가격 정보
    priceId: number | null;
    baseDate: string | null;
    pricePerKg: number | null;

    // 재고 정보
    stockId: number | null;
    weightPerBox: number | null;
    boxQty: number | null;

    // 등록 및 수정 일시
    createdAt: string;
    updatedAt: string;
}

// 상품 카테고리
export type ProductCategory =
    | "all"
    | "hanwoo"
    | "domestic"
    | "imported"
    | "us"
    | "au"
    | "wagyu";

// 상품 목록 조회
export async function getProductList(
    category: ProductCategory = "all"
): Promise<Product[]> {
    const params = new URLSearchParams({
        category,
    });

    const response = await fetch(
        `/api/products?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error("상품 목록 조회에 실패했습니다.");
    }

    return response.json();
}

// 상품 상세 조회
export async function getProductDetail(
    productId: number
): Promise<Product> {
    const response = await fetch(
        `/api/products/${productId}`
    );

    // 존재하지 않는 상품
    if (response.status === 404) {
        throw new Error("상품을 찾을 수 없습니다.");
    }

    if (!response.ok) {
        throw new Error("상품 상세 조회에 실패했습니다.");
    }

    return response.json();
}

// 중량(g)에 따른 판매 가격 계산
export function calculateProductPrice(
    pricePerKg: number,
    weightGram: number
): number {
    return Math.round((pricePerKg * weightGram) / 1000);
}
