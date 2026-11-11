
package com.portfolio.portfolio.Controller.product;

import com.portfolio.portfolio.Service.product.ProductService;
import com.portfolio.portfolio.Vo.product.ProductVO;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    // 상품 목록 조회
    @GetMapping
    public List<ProductVO> getProductList(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate baseDate,
            @RequestParam(defaultValue = "all")
            String category
    ) {
        return productService.getProductList(baseDate, category);
    }

    // 상품 상세 조회
    @GetMapping("/{productId}")
    public ProductVO getProductDetail(
            @PathVariable Long productId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate baseDate
    ) {
        // 상품 ID로 상세 정보 조회
        ProductVO product = productService.getProductDetail(
                productId,
                baseDate
        );

        // 존재하지 않는 상품은 404 반환
        if (product == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "상품을 찾을 수 없습니다."
            );
        }

        return product;
    }
}
