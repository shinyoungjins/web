
package com.portfolio.portfolio.Vo.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 주문 상품 상세 정보 VO
 *
 * shop_order_item 테이블의 주문 상품 정보를
 * 마이페이지 주문 상세 및 간편 재주문 기능에 사용합니다.
 */
@Data
public class OrderItemVo {

    /* 주문 상품 고유번호 */
    private Long orderItemId;

    /* 주문 고유번호 */
    private Long orderId;

    /* 상품 고유번호 */
    private Long productId;

    /* 주문 당시 상품명 */
    private String productName;

    /* 주문 당시 상품 단가 */
    private BigDecimal unitPrice;

    /* 주문 수량 */
    private BigDecimal quantity;

    /* 주문 상품 총금액 */
    private BigDecimal totalAmount;

    /* 등록일시 */
    private LocalDateTime createdAt;

    /* 수정일시 */
    private LocalDateTime updatedAt;
}
