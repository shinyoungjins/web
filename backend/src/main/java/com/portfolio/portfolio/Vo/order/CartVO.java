package com.portfolio.portfolio.Vo.order;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CartVO {

    // 장바구니 항목 ID
    private Long cartId;

    // 회원 ID
    private Long memberId;

    // 비회원 식별자
    private String guestId;

    // 상품 ID
    private Long productId;

    // 선택 중량(g): 1000, 5000, 10000
    private Integer weightGram;

    // 구매 수량
    private Integer quantity;

    // 등록 일시
    private LocalDateTime createdAt;

    // 수정 일시
    private LocalDateTime updatedAt;

    // 상품명 (조회용)
    private String productName;

    // 상품 이미지 (조회용)
    private String productImage;

    // 원산지 코드 (조회용)
    private String originCd;

    // 1kg 기준 단가 (조회용)
    private Integer pricePerKg;

    // 선택 중량 기준 단가 (계산용)
    private Integer unitPrice;

    // 상품별 총금액 (계산용)
    private Long totalPrice;
}
