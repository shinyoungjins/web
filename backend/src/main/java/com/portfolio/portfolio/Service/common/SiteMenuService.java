
package com.portfolio.portfolio.Service.common;

import com.portfolio.portfolio.Mapper.common.SiteMenuMapper;
import com.portfolio.portfolio.Vo.common.SiteMenuVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteMenuService {

    private final SiteMenuMapper siteMenuMapper;

    // 사용 중인 메뉴 목록 조회
    public List<SiteMenuVO> selectSiteMenuList() {
        return siteMenuMapper.selectSiteMenuList();
    }
}
