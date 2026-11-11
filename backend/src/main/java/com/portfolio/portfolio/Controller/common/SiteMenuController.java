
package com.portfolio.portfolio.Controller.common;

import com.portfolio.portfolio.Service.common.SiteMenuService;
import com.portfolio.portfolio.Vo.common.SiteMenuVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class SiteMenuController {

    private final SiteMenuService siteMenuService;

    // 사용 중인 메뉴 목록 조회
    @GetMapping
    public List<SiteMenuVO> selectSiteMenuList() {
        return siteMenuService.selectSiteMenuList();
    }
}
