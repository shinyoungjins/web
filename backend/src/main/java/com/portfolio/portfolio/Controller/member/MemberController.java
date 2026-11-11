package com.portfolio.portfolio.Controller.member;

import com.portfolio.portfolio.Service.member.MemberService;
import com.portfolio.portfolio.Vo.member.MemberVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping
    public List<MemberVO> selectMemberList() {
        return memberService.selectMemberList();
    }
}
