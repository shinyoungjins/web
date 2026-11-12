
package com.portfolio.portfolio.Controller.order;

import com.portfolio.portfolio.Service.auth.CurrentMemberService;
import com.portfolio.portfolio.Service.order.OrderService;
import com.portfolio.portfolio.Vo.order.ReceivableVo;
import com.portfolio.portfolio.Vo.order.OrderHistoryVo;
import com.portfolio.portfolio.Vo.order.OrderItemVo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 주문 및 미수금 관리 Controller
 *
 * 회원별 미수금 조회 및
 * 주문 관련 API를 제공합니다.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CurrentMemberService currentMemberService;

    /**
     * 로그인 회원의 미수금 조회
     *
     * GET /api/orders/receivable
     *
     * - 현재 미수금
     * - 누적 외상 주문금액
     * - 누적 입금액
     * - 외상 주문 가능 잔여 한도
     */
    @GetMapping("/receivable")
    public ResponseEntity<?> getMemberReceivable(
            Authentication authentication
    ) {

        /* 로그인 여부 확인 */
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                authentication.getPrincipal()
        )) {

            return ResponseEntity.status(401).body(
                    Map.of(
                            "message", "로그인이 필요합니다."
                    )
            );
        }

        try {

            /* 현재 로그인한 회원번호 조회 */
            Long memberId =
                    currentMemberService.getCurrentMemberId(
                            authentication
                    );

            /* 회원별 미수금 조회 */
            ReceivableVo receivable =
                    orderService.getMemberReceivable(memberId);

            /* 조회 결과 반환 */
            return ResponseEntity.ok(receivable);

        } catch (IllegalArgumentException e) {

            /* 회원 정보 조회 실패 */
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message", e.getMessage()
                    )
            );

        } catch (IllegalStateException e) {

            /* 인증 정보 또는 회원 조회 실패 */
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message", "로그인 회원 정보를 확인할 수 없습니다."
                    )
            );
        }
    }

    /**
     * 로그인 회원의 주문 내역 조회
     *
     * GET /api/orders/history
     * GET /api/orders/history?addressId=1
     *
     * - 로그인한 회원의 주문만 조회
     * - addressId 미입력 시 전체 주문 조회
     * - addressId 입력 시 해당 배송지 주문 조회
     * - 최신 주문순으로 반환
     */
    @GetMapping("/history")
    public ResponseEntity<?> getMemberOrderHistory(
            Authentication authentication,
            @RequestParam(
                    value = "addressId",
                    required = false
            ) Long addressId
    ) {

        /* 로그인 여부 확인 */
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                authentication.getPrincipal()
        )) {

            return ResponseEntity.status(401).body(
                    Map.of(
                            "message", "로그인이 필요합니다."
                    )
            );
        }

        try {

            /* 현재 로그인한 회원번호 조회 */
            Long memberId =
                    currentMemberService.getCurrentMemberId(
                            authentication
                    );

            /* 회원별 주문 내역 조회 */
            List<OrderHistoryVo> orderHistory =
                    orderService.getMemberOrderHistory(
                            memberId,
                            addressId
                    );

            /* 조회 결과 반환 */
            return ResponseEntity.ok(orderHistory);

        } catch (IllegalArgumentException e) {

            /* 잘못된 조회 조건 */
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message", e.getMessage()
                    )
            );

        } catch (IllegalStateException e) {

            /* 인증 정보 또는 회원 조회 실패 */
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "로그인 회원 정보를 확인할 수 없습니다."
                    )
            );
        }
    }

    /**
     * 로그인 회원의 주문별 상품 상세 조회
     *
     * GET /api/orders/history/{orderId}/items
     *
     * - 로그인 회원의 주문 상품만 조회
     * - 다른 회원의 주문 상품 조회 방지
     * - 주문 상품 등록순으로 반환
     */
    @GetMapping("/history/{orderId}/items")
    public ResponseEntity<?> getOrderItems(
            Authentication authentication,
            @PathVariable("orderId") Long orderId
    ) {

        /* 로그인 여부 확인 */
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                authentication.getPrincipal()
        )) {

            return ResponseEntity.status(401).body(
                    Map.of(
                            "message", "로그인이 필요합니다."
                    )
            );
        }

        try {

            /* 현재 로그인한 회원번호 조회 */
            Long memberId =
                    currentMemberService.getCurrentMemberId(
                            authentication
                    );

            /* 주문별 상품 상세 조회 */
            List<OrderItemVo> orderItems =
                    orderService.getOrderItems(
                            memberId,
                            orderId
                    );

            /* 조회 결과 반환 */
            return ResponseEntity.ok(orderItems);

        } catch (IllegalArgumentException e) {

            /* 잘못된 조회 조건 */
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message", e.getMessage()
                    )
            );

        } catch (IllegalStateException e) {

            /* 인증 정보 또는 회원 조회 실패 */
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "로그인 회원 정보를 확인할 수 없습니다."
                    )
            );
        }
    }
}
