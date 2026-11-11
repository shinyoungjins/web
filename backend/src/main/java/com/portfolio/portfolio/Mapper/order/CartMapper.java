package com.portfolio.portfolio.Mapper.order;

import com.portfolio.portfolio.Vo.order.CartVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CartMapper {

    // 장바구니 상품 목록 조회
    List<CartVO> selectCartList(
            @Param("memberId") Long memberId,
            @Param("guestId") String guestId,
            @Param("baseDate") LocalDate baseDate
    );

    // 동일 상품 및 중량 조회
    CartVO selectCartItem(
            @Param("memberId") Long memberId,
            @Param("guestId") String guestId,
            @Param("productId") Long productId,
            @Param("weightGram") Integer weightGram
    );

    // 장바구니 상품 등록
    int insertCart(CartVO cartVO);

    // 동일 상품 추가 시 수량 증가
    int increaseCartQuantity(
            @Param("cartId") Long cartId,
            @Param("memberId") Long memberId,
            @Param("guestId") String guestId,
            @Param("quantity") Integer quantity
    );

    // 장바구니 상품 수량 변경
    int updateCartQuantity(
            @Param("cartId") Long cartId,
            @Param("memberId") Long memberId,
            @Param("guestId") String guestId,
            @Param("quantity") Integer quantity
    );

    // 장바구니 상품 삭제
    int deleteCart(
            @Param("cartId") Long cartId,
            @Param("memberId") Long memberId,
            @Param("guestId") String guestId
    );
}
