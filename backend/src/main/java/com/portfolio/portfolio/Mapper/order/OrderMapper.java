
package com.portfolio.portfolio.Mapper.order;

import com.portfolio.portfolio.Vo.order.ReceivableVo;
import com.portfolio.portfolio.Vo.order.OrderHistoryVo;
import com.portfolio.portfolio.Vo.order.OrderItemVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

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
    /** 로그인 회원의 배송지 및 주문에 필요한 정보 조회 */
    Map<String, Object> selectOwnedAddress(@Param("memberId") Long memberId, @Param("addressId") Long addressId);

    /** 판매 중인 상품의 현재 적용 단가 조회 */
    Map<String, Object> selectCurrentProduct(@Param("productId") Long productId);

    /** 조건부 중량 재고 차감 (성공한 행 수 반환) */
    int decreaseProductStock(@Param("productId") Long productId, @Param("weightKg") BigDecimal weightKg);

    /** 주문 생성 후 생성된 주문 PK 반환 */
    Long insertOrder(@Param("orderNo") String orderNo, @Param("memberId") Long memberId,
                     @Param("addressId") Long addressId, @Param("addressName") String addressName,
                     @Param("ordererName") String ordererName, @Param("ordererPhone") String ordererPhone,
                     @Param("ordererEmail") String ordererEmail, @Param("totalAmount") BigDecimal totalAmount,
                     @Param("recipientName") String recipientName, @Param("recipientPhone") String recipientPhone,
                     @Param("zipcode") String zipcode, @Param("address") String address,
                     @Param("addressDetail") String addressDetail, @Param("deliveryMessage") String deliveryMessage);

    /** 주문 상품 추가 */
    int insertOrderItem(@Param("orderId") Long orderId, @Param("productId") Long productId,
                        @Param("productName") String productName, @Param("unitPrice") BigDecimal unitPrice,
                        @Param("quantity") Integer quantity, @Param("totalAmount") BigDecimal totalAmount);


    /** 주문 상품 추가 */
    int insertOrderItem(@Param("orderId") Long orderId, @Param("productId") Long productId, @Param("productName") String productName, @Param("weightGram") Integer weightGram, @Param("unitPrice") BigDecimal unitPrice, @Param("quantity") Integer quantity, @Param("totalAmount") BigDecimal totalAmount);

    /** 주문 취소 대상 조회 및 행 잠금 (동시 취소 방지) */
    Map<String, Object> selectOrderForCancel(@Param("memberId") Long memberId, @Param("orderId") Long orderId);

    /** 주문 취소 대상 상품 및 중량 조회 */
    List<Map<String, Object>> selectOrderItemsForCancel(@Param("orderId") Long orderId);

    /** 주문에 완료된 입금 내역이 있는지 확인 */
    int countCompletedPayments(@Param("orderId") Long orderId);

    /** 주문접수 상태의 주문을 취소 상태로 변경 */
    int updateOrderCancelled(@Param("memberId") Long memberId, @Param("orderId") Long orderId);

    /** 취소한 상품의 중량 재고 복구 */
    int restoreProductStock(@Param("productId") Long productId, @Param("weightKg") BigDecimal weightKg);

    /** 주문 생성 후 생성된 주문 PK 반환 */
    Long insertOrder(@Param("orderNo") String orderNo, @Param("memberId") Long memberId, @Param("addressId") Long addressId, @Param("addressName") String addressName, @Param("paymentType") String paymentType, @Param("ordererName") String ordererName, @Param("ordererPhone") String ordererPhone, @Param("ordererEmail") String ordererEmail, @Param("totalAmount") BigDecimal totalAmount, @Param("recipientName") String recipientName, @Param("recipientPhone") String recipientPhone, @Param("zipcode") String zipcode, @Param("address") String address, @Param("addressDetail") String addressDetail, @Param("deliveryMessage") String deliveryMessage);
}
