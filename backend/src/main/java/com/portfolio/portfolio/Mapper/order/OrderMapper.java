
package com.portfolio.portfolio.Mapper.order;

import com.portfolio.portfolio.Vo.order.ReceivableVo;
import com.portfolio.portfolio.Vo.order.OrderHistoryVo;
import com.portfolio.portfolio.Vo.order.OrderItemVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 주문 및 미수금 관리 Mapper
 *
 * 회원별 주문 정보와 미수금 정보를
 * PostgreSQL에서 조회합니다.
 */
@Mapper
public interface OrderMapper {

    /**
     * 회원별 미수금 조회
     *
     * @param memberId 회원 고유번호
     * @return 회원의 외상 주문금액, 입금액, 미수금 및 잔여 한도
     */
    ReceivableVo selectMemberReceivable(
            @Param("memberId") Long memberId
    );

    /**
     * 회원별 주문 내역 조회
     *
     * - 로그인 회원의 주문만 조회
     * - 배송지 선택 시 해당 배송지 주문만 조회
     * - 최신 주문순 정렬
     *
     * @param memberId 회원 고유번호
     * @param addressId 배송지 고유번호 (null이면 전체)
     * @return 회원 주문 내역
     */
    List<OrderHistoryVo> selectMemberOrderHistory(
            @Param("memberId") Long memberId,
            @Param("addressId") Long addressId
    );

    /**
     * 주문별 상품 상세 조회
     *
     * - 로그인 회원의 주문만 조회
     * - 해당 주문에 포함된 상품 목록 조회
     *
     * @param memberId 회원 고유번호
     * @param orderId 주문 고유번호
     * @return 주문 상품 목록
     */
    List<OrderItemVo> selectOrderItems(
            @Param("memberId") Long memberId,
            @Param("orderId") Long orderId
    );
}
