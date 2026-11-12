
package com.portfolio.portfolio.Vo.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 회원 주문 내역 조회 VO
 *
 * shop_order 테이블의 주문 정보를
 * 마이페이지 주문 관리 화면에 전달합니다.
 */
@Data
public class OrderHistoryVo {

    /* 주문 고유번호 */
    private Long orderId;

    /* 주문번호 */
    private String orderNo;

    /* 회원 고유번호 */
    private Long memberId;

    /* 배송지 고유번호 */
    private Long addressId;

    /* 주문 당시 배송지 별칭 */
    private String addressName;

    /* 주문 상태 */
    private String orderStatus;

    /* 결제 유형 (IMMEDIATE / CREDIT) */
    private String paymentType;

    /* 결제 상태 */
    private String paymentStatus;

    /* 주문 총금액 */
    private BigDecimal totalAmount;

    /* 주문일시 */
    private LocalDateTime createdAt;
}
