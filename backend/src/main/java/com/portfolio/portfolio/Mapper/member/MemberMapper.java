package com.portfolio.portfolio.Mapper.member;

import com.portfolio.portfolio.Vo.member.MemberVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface MemberMapper {
    List<MemberVO> selectMemberList();
}
