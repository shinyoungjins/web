
package com.portfolio.portfolio.Service.order;

import com.portfolio.portfolio.Mapper.order.CartMapper;
import com.portfolio.portfolio.Mapper.product.ProductMapper;
import com.portfolio.portfolio.Vo.order.CartVO;
import com.portfolio.portfolio.Vo.product.ProductVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartMapper cartMapper;
    private final ProductMapper productMapper;

    // 장바구니 상품 목록 조회
    @Transactional(readOnly = true)
    public List<CartVO> getCartList(Long memberId, String guestId) {
        validateOwner(memberId, guestId);
        return cartMapper.selectCartList(memberId, guestId, LocalDate.now());
    }

    // 장바구니 상품 추가
    @Transactional
    public void addCart(CartVO cartVO) {

        validateOwner(cartVO.getMemberId(), cartVO.getGuestId());

        // 상품 및 선택값 검증
        validateCartItem(cartVO);

        // 판매 중인 상품인지 확인
        ProductVO product = productMapper.selectProductDetail(
                cartVO.getProductId(),
                LocalDate.now()
        );

        if (product == null || product.getPricePerKg() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "판매 가능한 상품이 아닙니다."
            );
        }

        // 동일 상품 및 중량이 이미 담겨 있는지 확인
        CartVO existingCart = cartMapper.selectCartItem(
                cartVO.getMemberId(),
                cartVO.getGuestId(),
                cartVO.getProductId(),
                cartVO.getWeightGram()
        );

        if (existingCart != null) {

            // 기존 상품이면 수량 누적
            cartMapper.increaseCartQuantity(
                    existingCart.getCartId(),
                    cartVO.getMemberId(),
                    cartVO.getGuestId(),
                    cartVO.getQuantity()
            );

        } else {

            // 신규 상품이면 장바구니 등록
            cartMapper.insertCart(cartVO);
        }
    }

    // 장바구니 상품 수량 변경
    @Transactional
    public void updateCartQuantity(Long cartId, Long memberId, String guestId, Integer quantity) {

        validateOwner(memberId, guestId);

        if (quantity == null || quantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "수량은 1개 이상이어야 합니다."
            );
        }

        int updatedCount = cartMapper.updateCartQuantity(
                cartId,
                memberId,
                guestId,
                quantity
        );

        if (updatedCount == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "장바구니 상품을 찾을 수 없습니다."
            );
        }
    }

    // 장바구니 상품 삭제
    @Transactional
    public void deleteCart(Long cartId, Long memberId, String guestId) {

        validateOwner(memberId, guestId);

        int deletedCount = cartMapper.deleteCart(
                cartId,
                memberId,
                guestId
        );

        if (deletedCount == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "장바구니 상품을 찾을 수 없습니다."
            );
        }
    }

    // 회원 및 비회원 식별자 검증
    private void validateOwner(Long memberId, String guestId) {

        boolean hasMemberId = memberId != null;
        boolean hasGuestId = guestId != null && !guestId.isBlank();

        if (hasMemberId == hasGuestId) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "장바구니 사용자 정보가 올바르지 않습니다."
            );
        }
    }

    // 장바구니 상품 정보 검증
    private void validateCartItem(CartVO cartVO) {

        if (cartVO.getProductId() == null || cartVO.getProductId() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "상품 정보가 올바르지 않습니다."
            );
        }

        // 선택 가능한 중량: 1kg, 5kg, 10kg
        Integer weightGram = cartVO.getWeightGram();

        if (weightGram == null ||
                (weightGram != 1000 &&
                        weightGram != 5000 &&
                        weightGram != 10000)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "선택할 수 없는 상품 중량입니다."
            );
        }

        if (cartVO.getQuantity() == null || cartVO.getQuantity() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "수량은 1개 이상이어야 합니다."
            );
        }
    }
}
