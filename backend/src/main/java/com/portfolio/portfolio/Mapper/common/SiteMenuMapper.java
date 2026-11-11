
package com.portfolio.portfolio.Mapper.common;

import com.portfolio.portfolio.Vo.common.SiteMenuVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SiteMenuMapper {

    // 사용 중인 전체 메뉴 조회
    List<SiteMenuVO> selectSiteMenuList();

}
