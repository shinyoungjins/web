
package com.portfolio.portfolio.Service.product;

import com.portfolio.portfolio.Mapper.product.ProductMapper;
import com.portfolio.portfolio.Vo.product.ProductVO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;

    // 상품 목록 조회
    public List<ProductVO> getProductList(
            LocalDate baseDate,
            String category
    ) {
        // 날짜 미지정 시 오늘 날짜 사용
        if (baseDate == null) {
            baseDate = LocalDate.now();
        }

        // 카테고리 미지정 시 전체 상품 조회
        if (category == null || category.isBlank()) {
            category = "all";
        }

        return productMapper.selectProductList(
                baseDate,
                category
        );
    }

    // 상품 상세 조회
    public ProductVO getProductDetail(
            Long productId,
            LocalDate baseDate
    ) {
        // 날짜 미지정 시 오늘 날짜 사용
        if (baseDate == null) {
            baseDate = LocalDate.now();
        }

        // 상품 ID로 상세 정보 조회
        return productMapper.selectProductDetail(
                productId,
                baseDate
        );
    }
}
