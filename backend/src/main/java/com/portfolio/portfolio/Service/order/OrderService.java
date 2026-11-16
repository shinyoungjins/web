
package com.portfolio.portfolio.Service.order;

import com.portfolio.portfolio.Mapper.order.OrderMapper;
import com.portfolio.portfolio.Vo.order.ReceivableVo;
import com.portfolio.portfolio.Vo.order.OrderHistoryVo;
import com.portfolio.portfolio.Vo.order.OrderItemVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;
import java.math.BigDecimal;

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
    public List<OrderHistoryVo> getMemberOrderHistory(Long memberId, Long addressId) {

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
        return orderMapper.selectMemberOrderHistory(memberId, addressId);
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
    public List<OrderItemVo> getOrderItems(Long memberId, Long orderId) {

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
        return orderMapper.selectOrderItems(memberId, orderId);
    }

    /**
     * 바로 주문 요청. 단가는 서버에서 다시 계산합니다.
     * weightGram은 상품 한 개의 중량이며 quantity는 개수입니다.
     */
    public record CreateOrderItem(Long productId, Integer weightGram, Integer quantity) {}

    public record CreateOrderRequest(Long addressId, String ordererName, String ordererPhone, String ordererEmail, String deliveryMessage, String paymentType, List<CreateOrderItem> items) {}

    public record CreateOrderResponse(Long orderId, String orderNo, BigDecimal totalAmount) {}

    private record PreparedItem(Long productId, String productName, BigDecimal weightKg, Integer quantity, BigDecimal unitPrice, BigDecimal totalAmount) {}

    /**
     * 회원 바로 주문 생성
     * - 회원 배송지 확인
     * - 판매 단가를 서버에서 검증하고 재계산
     * - 재고 차감, 주문 및 상품 저장을 하나의 트랜잭션으로 처리
     */
    @Transactional(rollbackFor = Exception.class)
    public CreateOrderResponse createOrder(Long memberId, CreateOrderRequest request) {
        if (memberId == null || request == null || request.addressId() == null || request.addressId() <= 0) {
            throw new IllegalArgumentException("회원 및 배송지 정보가 올바르지 않습니다.");
        }
        if (request.ordererName() == null || request.ordererName().isBlank()
                || request.ordererPhone() == null || request.ordererPhone().isBlank()) {
            throw new IllegalArgumentException("주문자 이름과 연락처가 필요합니다.");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("주문할 상품을 선택해 주세요.");
        }

        // 기존 프런트엔드와의 호환성을 위해 미입력 시 외상 결제로 처리합니다.
        String paymentType = request.paymentType() == null ? "CREDIT" : request.paymentType();

        if (!List.of("CREDIT", "IMMEDIATE").contains(paymentType)) {
            throw new IllegalArgumentException("지원하지 않는 결제 방식입니다.");
        }

        // 토스 결제 승인 API가 완성되기 전까지 즉시 결제 주문 생성을 차단합니다.
        if ("IMMEDIATE".equals(paymentType)) {
            throw new IllegalStateException("토스페이먼츠 결제 연동 준비 중입니다.");
        }

        Map<String, Object> address = orderMapper.selectOwnedAddress(memberId, request.addressId());
        if (address == null) {
            throw new IllegalArgumentException("선택한 배송지가 존재하지 않거나 본인 배송지가 아닙니다.");
        }

        List<PreparedItem> prepared = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CreateOrderItem item : request.items()) {
            if (item == null || item.productId() == null || item.productId() <= 0
                    || item.weightGram() == null || !List.of(1000, 5000, 10000).contains(item.weightGram())
                    || item.quantity() == null || item.quantity() < 1 || item.quantity() > 1000) {
                throw new IllegalArgumentException("상품 중량 또는 수량이 올바르지 않습니다.");
            }

            Map<String, Object> product = orderMapper.selectCurrentProduct(item.productId());
            if (product == null) {
                throw new IllegalArgumentException("판매 가능한 상품 또는 단가가 없습니다. 상품번호: " + item.productId());
            }

            BigDecimal pricePerKg = new BigDecimal(product.get("pricePerKg").toString());
            if (pricePerKg.signum() < 0) {
                throw new IllegalArgumentException("상품 단가가 올바르지 않습니다.");
            }

            BigDecimal weightKg = BigDecimal.valueOf(item.weightGram()).movePointLeft(3);
            BigDecimal unitPrice = pricePerKg.multiply(weightKg);
            BigDecimal itemAmount = unitPrice.multiply(BigDecimal.valueOf(item.quantity()));

            prepared.add(new PreparedItem(
                    item.productId(),
                    product.get("productName").toString(),
                    weightKg,
                    item.quantity(),
                    unitPrice,
                    itemAmount
            ));

            totalAmount = totalAmount.add(itemAmount);
        }

        // 동일 상품이 여러 번 포함되어도 조건부 UPDATE가 누적 차감을 검증합니다.
        for (PreparedItem item : prepared) {
            BigDecimal requestedKg = item.weightKg().multiply(BigDecimal.valueOf(item.quantity()));
            if (orderMapper.decreaseProductStock(item.productId(), requestedKg) != 1) {
                throw new IllegalArgumentException("상품 재고가 부족하거나 재고 행이 중복되었습니다. 상품번호: " + item.productId());
            }
        }

        String orderNo = "ORD-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();

        Long orderId = orderMapper.insertOrder(
                orderNo,
                memberId,
                request.addressId(),
                (String) address.get("addressName"),
                paymentType,
                request.ordererName().trim(),
                request.ordererPhone().trim(),
                request.ordererEmail(),
                totalAmount,
                (String) address.get("recipientName"),
                (String) address.get("recipientPhone"),
                (String) address.get("zipcode"),
                (String) address.get("address"),
                (String) address.get("addressDetail"),
                request.deliveryMessage()
        );

        if (orderId == null) {
            throw new IllegalStateException("주문 생성에 실패했습니다.");
        }

        for (PreparedItem item : prepared) {
            Integer weightGram = item.weightKg().movePointRight(3).intValueExact();
            if (orderMapper.insertOrderItem(orderId, item.productId(), item.productName(), weightGram, item.unitPrice(), item.quantity(), item.totalAmount()) != 1) {
                throw new IllegalStateException("주문 상품 저장에 실패했습니다.");
            }
        }

        return new CreateOrderResponse(orderId, orderNo, totalAmount);
    }

    /**
     * 회원 주문 취소
     *
     * - 본인 주문만 취소 가능
     * - 주문접수(PENDING) 상태만 취소 가능
     * - 입금 내역이 있는 주문은 자동 취소 차단
     * - 주문 당시 중량을 기준으로 재고 복구
     * - 주문 상태 변경과 재고 복구를 하나의 트랜잭션으로 처리
     */
    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long memberId, Long orderId) {

        /* 회원 및 주문번호 검증 */
        if (memberId == null || memberId <= 0 || orderId == null || orderId <= 0) {
            throw new IllegalArgumentException("회원 또는 주문번호가 올바르지 않습니다.");
        }

        /* 본인 주문 조회 및 행 잠금 */
        Map<String, Object> order = orderMapper.selectOrderForCancel(memberId, orderId);

        if (order == null) {
            throw new IllegalArgumentException("존재하지 않거나 본인 주문이 아닙니다.");
        }

        /* 주문 상태 검증 */
        if (!"PENDING".equals(order.get("orderStatus"))) {
            throw new IllegalStateException("주문접수 상태의 주문만 취소할 수 있습니다.");
        }

        /* 결제 상태 검증 */
        if (!"UNPAID".equals(order.get("paymentStatus"))) {
            throw new IllegalStateException("결제가 진행된 주문은 자동 취소할 수 없습니다.");
        }

        /* 완료된 입금 내역 확인 */
        if (orderMapper.countCompletedPayments(orderId) > 0) {
            throw new IllegalStateException("입금 내역이 있는 주문은 자동 취소할 수 없습니다.");
        }

        /* 주문 상품 조회 */
        List<Map<String, Object>> items = orderMapper.selectOrderItemsForCancel(orderId);

        if (items == null || items.isEmpty()) {
            throw new IllegalStateException("주문 상품 정보가 없어 취소할 수 없습니다.");
        }

        /* 모든 상품의 중량과 수량을 먼저 검증 */
        Map<Long, BigDecimal> restoreWeights = new java.util.HashMap<>();

        for (Map<String, Object> item : items) {
            if (item.get("productId") == null || item.get("weightGram") == null
                    || item.get("quantity") == null) {
                throw new IllegalStateException("주문 당시 중량 정보가 없어 자동 취소할 수 없습니다.");
            }

            Long productId = ((Number) item.get("productId")).longValue();
            int weightGram = ((Number) item.get("weightGram")).intValue();
            BigDecimal quantity = new BigDecimal(item.get("quantity").toString());

            if (productId <= 0 || !List.of(1000, 5000, 10000).contains(weightGram)
                    || quantity.signum() <= 0
                    || quantity.stripTrailingZeros().scale() > 0) {
                throw new IllegalStateException("주문 상품의 중량 또는 수량이 올바르지 않습니다.");
            }

            BigDecimal restoreKg = BigDecimal.valueOf(weightGram)
                    .movePointLeft(3)
                    .multiply(quantity);

            restoreWeights.merge(productId, restoreKg, BigDecimal::add);
        }

        /* 주문 상태 변경 */
        if (orderMapper.updateOrderCancelled(memberId, orderId) != 1) {
            throw new IllegalStateException("주문 취소 처리에 실패했습니다.");
        }

        /* 상품별 재고 복구 */
        for (Map.Entry<Long, BigDecimal> entry : restoreWeights.entrySet()) {
            if (orderMapper.restoreProductStock(entry.getKey(), entry.getValue()) != 1) {
                throw new IllegalStateException(
                        "상품 재고 복구에 실패했습니다. 상품번호: " + entry.getKey()
                );
            }
        }
    }
}
