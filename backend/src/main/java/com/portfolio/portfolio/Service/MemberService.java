
package com.portfolio.portfolio.Service;

import com.portfolio.portfolio.Vo.MemberVO;
import com.portfolio.portfolio.Mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberMapper memberMapper;

    public List<MemberVO> selectMemberList() {
        return memberMapper.selectMemberList();
    }
}
