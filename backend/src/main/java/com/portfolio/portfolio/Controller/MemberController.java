package com.portfolio.portfolio.Controller;

import com.portfolio.portfolio.Service.MemberService;
import com.portfolio.portfolio.Vo.MemberVO;
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
