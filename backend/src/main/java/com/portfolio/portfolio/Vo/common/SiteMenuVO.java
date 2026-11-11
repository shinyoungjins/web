package com.portfolio.portfolio.Vo.common;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SiteMenuVO {

    // 메뉴 고유번호
    private Long menuId;

    // 메뉴명
    private String menuName;

    // 메뉴 이동 URL
    private String menuUrl;

    // 상위 메뉴 ID (최상위 메뉴는 null)
    private Long parentMenuId;

    // 메뉴 정렬 순서
    private Integer sortOrder;

    // 사용 여부 (Y/N)
    private String useYn;

    // 등록일시
    private LocalDateTime createdAt;

    // 수정일시
    private LocalDateTime updatedAt;
}
