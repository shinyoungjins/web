
package com.portfolio.portfolio.Controller.order;

import com.portfolio.portfolio.Service.order.CartService;
import com.portfolio.portfolio.Vo.order.CartVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    // 장바구니 목록 조회
    @GetMapping
    public List<CartVO> getCartList(HttpSession session) {
        String guestId = getGuestId(session);
        return cartService.getCartList(null, guestId);
    }

    // 장바구니 상품 추가
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void addCart(@RequestBody CartVO cartVO, HttpSession session) {

        // 사용자 식별자는 요청값이 아닌 서버 세션에서 설정
        cartVO.setMemberId(null);
        cartVO.setGuestId(getGuestId(session));

        cartService.addCart(cartVO);
    }

    // 장바구니 상품 수량 변경
    @PatchMapping("/{cartId}")
    public void updateCartQuantity(@PathVariable Long cartId, @RequestBody CartVO cartVO, HttpSession session) {
        String guestId = getGuestId(session);
        cartService.updateCartQuantity(cartId, null, guestId, cartVO.getQuantity());
    }

    // 장바구니 상품 삭제
    @DeleteMapping("/{cartId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCart(@PathVariable Long cartId, HttpSession session) {
        String guestId = getGuestId(session);
        cartService.deleteCart(cartId, null, guestId);
    }

    // 비회원 장바구니 식별자 발급 및 조회
    private String getGuestId(HttpSession session) {

        Object storedGuestId = session.getAttribute("cartGuestId");

        if (storedGuestId instanceof String guestId && !guestId.isBlank()) {
            return guestId;
        }

        // 비회원 식별자는 서버에서 UUID로 생성
        String guestId = UUID.randomUUID().toString();
        session.setAttribute("cartGuestId", guestId);

        return guestId;
    }
}
