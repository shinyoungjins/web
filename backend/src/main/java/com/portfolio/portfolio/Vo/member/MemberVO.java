package com.portfolio.portfolio.Vo.member;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MemberVO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
