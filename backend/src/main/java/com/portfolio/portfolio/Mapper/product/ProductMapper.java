package com.portfolio.portfolio.Mapper.product;

import com.portfolio.portfolio.Vo.product.ProductVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ProductMapper {

    // 상품 목록 조회
    List<ProductVO> selectProductList(
            @Param("baseDate") LocalDate baseDate,
            @Param("category") String category
    );

    // 상품 상세 조회
    ProductVO selectProductDetail(
            @Param("productId") Long productId,
            @Param("baseDate") LocalDate baseDate
    );

}
