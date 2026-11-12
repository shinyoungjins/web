
package com.portfolio.portfolio.Vo.auth;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 소셜 로그인 회원 정보 VO
 *
 * member 및 member_social 테이블 연동에 사용합니다.
 */
@Getter
@Setter
public class SocialMemberVo {

    /* 회원 정보 */
    private Long memberId;
    private String memberName;
    private String email;
    private String phone;
    private String role;
    private String useYn;
    private LocalDateTime updatedAt;

    /* 소셜 계정 정보 */
    private Long socialId;
    private String provider;
    private String providerUserId;
    private LocalDateTime createdAt;
}
