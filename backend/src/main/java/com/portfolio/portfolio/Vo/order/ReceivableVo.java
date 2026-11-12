package com.portfolio.portfolio.Vo.order;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 회원별 미수금 조회 VO
 *
 * 회원의 외상 주문금액, 입금액,
 * 현재 미수금 및 외상 주문 가능 한도를 관리합니다.
 */
@Getter
@Setter
public class ReceivableVo {

    /* 회원 고유번호 */
    private Long memberId;

    /* 회원 이름 */
    private String memberName;

    /* 누적 외상 주문금액 */
    private BigDecimal totalCreditAmount;

    /* 누적 입금액 */
    private BigDecimal totalPaidAmount;

    /* 현재 미수금 */
    private BigDecimal receivableAmount;

    /* 외상 주문 가능 잔여 한도 */
    private BigDecimal availableCreditAmount;
}