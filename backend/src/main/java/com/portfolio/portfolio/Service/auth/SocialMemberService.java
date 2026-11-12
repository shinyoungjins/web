
package com.portfolio.portfolio.Service.auth;

import com.portfolio.portfolio.Mapper.auth.SocialMemberMapper;
import com.portfolio.portfolio.Vo.auth.SocialMemberVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

/**
 * 소셜 로그인 회원 관리 서비스
 *
 * 카카오, 네이버, 구글 공통 사용
 */
@Service
@RequiredArgsConstructor
public class SocialMemberService {

    private final SocialMemberMapper socialMemberMapper;

    /* 이메일 형식 검증 */
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    /**
     * 소셜 로그인 회원 조회 및 신규 등록
     *
     * 기존 회원이면 회원 정보를 반환하고,
     * 신규 회원이면 member 및 member_social 테이블에 등록합니다.
     *
     * 두 테이블의 등록 작업은 하나의 트랜잭션으로 처리합니다.
     */
    @Transactional
    public SocialMemberVo findOrCreateMember(
            String provider,
            String providerUserId,
            String memberName,
            String email
    ) {

        /* 소셜 로그인 제공자 검증 */
        if (!"KAKAO".equals(provider)
                && !"NAVER".equals(provider)
                && !"GOOGLE".equals(provider)) {
            throw new IllegalArgumentException(
                    "지원하지 않는 소셜 로그인 제공자입니다: " + provider
            );
        }

        /* 소셜 사용자 고유 ID 검증 */
        if (providerUserId == null || providerUserId.isBlank()) {
            throw new IllegalArgumentException(
                    "소셜 사용자 고유 ID가 없습니다."
            );
        }

        /* 기존 소셜 회원 조회 */
        SocialMemberVo member = socialMemberMapper.selectSocialMember(
                provider,
                providerUserId
        );

        if (member != null) {
            return member;
        }

        /* 신규 회원 정보 생성 */
        SocialMemberVo newMember = new SocialMemberVo();

        newMember.setMemberName(memberName);
        newMember.setEmail(email);
        newMember.setProvider(provider);
        newMember.setProviderUserId(providerUserId);
        newMember.setRole("USER");
        newMember.setUseYn("Y");

        /* member 테이블 등록 */
        socialMemberMapper.insertMember(newMember);

        /* 자동 생성된 회원 ID 확인 */
        if (newMember.getMemberId() == null) {
            throw new IllegalStateException(
                    "회원 등록 후 member_id를 가져오지 못했습니다."
            );
        }

        /* member_social 테이블 등록 */
        socialMemberMapper.insertMemberSocial(newMember);

        return newMember;
    }

    /**
     * 로그인한 소셜 계정의 DB 회원 정보 조회
     *
     * 카카오, 네이버, 구글 공통 사용
     */
    @Transactional(readOnly = true)
    public SocialMemberVo getSocialMember(
            String provider,
            String providerUserId
    ) {

        /* 소셜 계정으로 회원 정보 조회 */
        return socialMemberMapper.selectSocialMember(
                provider,
                providerUserId
        );
    }

    /**
     * 로그인한 회원의 프로필 수정
     *
     * 소셜 계정으로 본인 확인 후
     * 회원 이름, 연락처, 이메일을 수정합니다.
     *
     * 수정 완료 후 최신 회원 정보를 반환합니다.
     */
    @Transactional
    public SocialMemberVo updateMemberProfile(
            String provider,
            String providerUserId,
            String memberName,
            String phone,
            String email
    ) {

        /* 소셜 계정으로 로그인 회원 조회 */
        SocialMemberVo member = socialMemberMapper.selectSocialMember(
                provider,
                providerUserId
        );

        /* 회원 정보가 존재하지 않는 경우 */
        if (member == null) {
            throw new IllegalStateException(
                    "로그인한 회원 정보를 찾을 수 없습니다."
            );
        }

        /* 회원 이름 필수 입력 검증 */
        if (memberName == null || memberName.isBlank()) {
            throw new IllegalArgumentException(
                    "회원 이름을 입력해 주세요."
            );
        }

        /* 회원 이름 길이 검증 */
        String normalizedName = memberName.trim();

        if (normalizedName.length() > 100) {
            throw new IllegalArgumentException(
                    "회원 이름은 100자 이내로 입력해 주세요."
            );
        }

        /* 연락처 공백 처리 */
        String normalizedPhone =
                phone == null || phone.isBlank()
                        ? null
                        : phone.trim();

        /* 연락처 형식 검증 */
        if (normalizedPhone != null
                && !normalizedPhone.matches("^01[016789]-?\\d{3,4}-?\\d{4}$")) {
            throw new IllegalArgumentException(
                    "올바른 휴대전화 번호를 입력해 주세요."
            );
        }

        /* 이메일 공백 처리 */
        String normalizedEmail =
                email == null || email.isBlank()
                        ? null
                        : email.trim();

        /* 이메일 형식 및 길이 검증 */
        if (normalizedEmail != null) {
            if (normalizedEmail.length() > 254) {
                throw new IllegalArgumentException(
                        "이메일은 254자 이내로 입력해 주세요."
                );
            }

            if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
                throw new IllegalArgumentException(
                        "올바른 이메일 주소를 입력해 주세요."
                );
            }
        }

        /* DB 회원 정보 수정 */
        int updatedRows = socialMemberMapper.updateMemberProfile(
                member.getMemberId(),
                normalizedName,
                normalizedPhone,
                normalizedEmail
        );

        /* 수정 결과 확인 */
        if (updatedRows != 1) {
            throw new IllegalStateException(
                    "회원 정보 수정에 실패했습니다."
            );
        }

        /* 수정된 회원 정보 재조회 */
        return socialMemberMapper.selectSocialMember(
                provider,
                providerUserId
        );
    }
}
