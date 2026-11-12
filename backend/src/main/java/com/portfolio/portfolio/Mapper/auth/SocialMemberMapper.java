
package com.portfolio.portfolio.Mapper.auth;

import com.portfolio.portfolio.Vo.auth.SocialMemberVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 소셜 로그인 회원 DB 처리 Mapper
 *
 * 카카오, 네이버, 구글 공통 사용
 */
@Mapper
public interface SocialMemberMapper {

    /**
     * 소셜 계정으로 기존 회원 조회
     */
    SocialMemberVo selectSocialMember(
            @Param("provider") String provider,
            @Param("providerUserId") String providerUserId
    );

    /**
     * 신규 회원 등록
     */
    int insertMember(SocialMemberVo member);

    /**
     * 신규 회원의 소셜 계정 연결
     */
    int insertMemberSocial(SocialMemberVo member);

    /**
     * 회원 정보 수정
     *
     * 회원 이름, 연락처, 수정 일시 변경
     */
    int updateMemberProfile(
            @Param("memberId") Long memberId,
            @Param("memberName") String memberName,
            @Param("phone") String phone,
            @Param("email") String email
    );
}
