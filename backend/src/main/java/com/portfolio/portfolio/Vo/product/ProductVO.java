
package com.portfolio.portfolio.Vo.product;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProductVO {

    // 상품 정보
    private Long productId;
    private String productName;
    private String productDesc;
    private String productImage;
    private String productCategory;

    // 원산지 및 한우 여부
    private String hanwooYn;
    private String originCd;

    // 사용 여부
    private String useYn;

    // 상품 가격 정보
    private Long priceId;
    private LocalDate baseDate;
    private Integer pricePerKg;

    // 상품 재고 정보
    private Long stockId;
    private BigDecimal weightPerBox;
    private Integer boxQty;

    // 등록 및 수정 일시
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
