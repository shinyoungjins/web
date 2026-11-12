
package com.portfolio.portfolio.Service.order;

import com.portfolio.portfolio.Mapper.order.OrderMapper;
import com.portfolio.portfolio.Vo.order.ReceivableVo;
import com.portfolio.portfolio.Vo.order.OrderHistoryVo;
import com.portfolio.portfolio.Vo.order.OrderItemVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 주문 및 미수금 관리 서비스
 *
 * 주문 관련 비즈니스 로직과
 * 회원별 미수금 조회 기능을 처리합니다.
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderMapper orderMapper;

    /**
     * 회원별 미수금 조회
     *
     * - 회원의 모든 배송지 외상 주문 합산
     * - 완료된 입금 내역 반영
     * - 현재 미수금 계산
     * - 외상 주문 가능 잔여 한도 조회
     *
     * @param memberId 회원 고유번호
     * @return 회원별 미수금 정보
     */
    public ReceivableVo getMemberReceivable(Long memberId) {

        if (memberId == null) {
            throw new IllegalArgumentException(
                    "회원 고유번호가 필요합니다."
            );
        }

        ReceivableVo receivable =
                orderMapper.selectMemberReceivable(memberId);

        if (receivable == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 회원입니다."
            );
        }

        return receivable;
    }

    /**
     * 회원별 주문 내역 조회
     *
     * - 로그인한 회원의 주문만 조회
     * - 배송지 선택 시 해당 배송지의 주문만 조회
     * - 배송지를 선택하지 않으면 전체 주문 조회
     * - 최신 주문순으로 반환
     *
     * @param memberId 회원 고유번호
     * @param addressId 배송지 고유번호 (null이면 전체)
     * @return 회원별 주문 내역
     */
    public List<OrderHistoryVo> getMemberOrderHistory(
            Long memberId,
            Long addressId
    ) {

        /* 회원번호 필수 검증 */
        if (memberId == null) {
            throw new IllegalArgumentException(
                    "회원 고유번호가 필요합니다."
            );
        }

        /* 배송지 번호 유효성 검증 */
        if (addressId != null && addressId <= 0) {
            throw new IllegalArgumentException(
                    "올바른 배송지 번호가 필요합니다."
            );
        }

        /* 회원별 주문 내역 조회 */
        return orderMapper.selectMemberOrderHistory(
                memberId,
                addressId
        );
    }

    /**
     * 주문별 상품 상세 조회
     *
     * - 로그인 회원의 주문 상품만 조회
     * - 주문 고유번호를 기준으로 상품 목록 조회
     * - 다른 회원의 주문 상품 조회 방지
     *
     * @param memberId 회원 고유번호
     * @param orderId 주문 고유번호
     * @return 주문 상품 목록
     */
    public List<OrderItemVo> getOrderItems(
            Long memberId,
            Long orderId
    ) {

        /* 회원번호 필수 검증 */
        if (memberId == null) {
            throw new IllegalArgumentException(
                    "회원 고유번호가 필요합니다."
            );
        }

        /* 주문번호 필수 검증 */
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException(
                    "올바른 주문번호가 필요합니다."
            );
        }

        /* 로그인 회원의 주문 상품 상세 조회 */
        return orderMapper.selectOrderItems(
                memberId,
                orderId
        );
    }
}
