package com.portfolio.portfolio.Mapper;

import com.portfolio.portfolio.Vo.MemberVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface MemberMapper {
    List<MemberVO> selectMemberList();
}
