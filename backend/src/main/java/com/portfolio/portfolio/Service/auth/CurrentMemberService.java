
package com.portfolio.portfolio.Service.auth;

import com.portfolio.portfolio.Vo.auth.SocialMemberVo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 현재 로그인 회원 정보 조회 서비스
 *
 * 카카오, 네이버, 구글 OAuth2 로그인 정보를
 * DB 회원 정보와 연결합니다.
 *
 * 주문, 배송지, 마이페이지 등에서 공통 사용합니다.
 */
@Service
@RequiredArgsConstructor
public class CurrentMemberService {

    private final SocialMemberService socialMemberService;

    /**
     * 현재 로그인 회원 정보 조회
     *
     * @param authentication Spring Security 인증 정보
     * @return DB에 등록된 회원 정보
     */
    public SocialMemberVo getCurrentMember(
            Authentication authentication
    ) {

        /* 로그인 여부 및 OAuth2 인증 확인 */
        if (!(authentication instanceof OAuth2AuthenticationToken token)
                || !authentication.isAuthenticated()) {
            throw new IllegalStateException(
                    "로그인이 필요합니다."
            );
        }

        String registrationId =
                token.getAuthorizedClientRegistrationId();

        Object principal = authentication.getPrincipal();

        String provider;
        String providerUserId;

        /* 카카오 로그인 */
        if ("kakao".equalsIgnoreCase(registrationId)) {

            if (!(principal instanceof OidcUser user)) {
                throw new IllegalStateException(
                        "카카오 사용자 정보를 확인할 수 없습니다."
                );
            }

            provider = "KAKAO";
            providerUserId = user.getSubject();

            /* 네이버 로그인 */
        } else if ("naver".equalsIgnoreCase(registrationId)) {

            if (!(principal instanceof OAuth2User user)) {
                throw new IllegalStateException(
                        "네이버 사용자 정보를 확인할 수 없습니다."
                );
            }

            Object responseObject = user.getAttribute("response");

            if (!(responseObject instanceof Map<?, ?> naverUser)) {
                throw new IllegalStateException(
                        "네이버 사용자 정보를 확인할 수 없습니다."
                );
            }

            Object id = naverUser.get("id");

            if (!(id instanceof String socialId)
                    || socialId.isBlank()) {
                throw new IllegalStateException(
                        "네이버 사용자 고유 ID를 확인할 수 없습니다."
                );
            }

            provider = "NAVER";
            providerUserId = socialId;

            /* 구글 로그인 */
        } else if ("google".equalsIgnoreCase(registrationId)) {

            if (!(principal instanceof OidcUser user)) {
                throw new IllegalStateException(
                        "구글 사용자 정보를 확인할 수 없습니다."
                );
            }

            provider = "GOOGLE";
            providerUserId = user.getSubject();

        } else {
            throw new IllegalStateException(
                    "지원하지 않는 소셜 로그인 제공자입니다."
            );
        }

        /* 소셜 계정과 연결된 DB 회원 조회 */
        SocialMemberVo member = socialMemberService.getSocialMember(
                provider,
                providerUserId
        );

        if (member == null || member.getMemberId() == null) {
            throw new IllegalStateException(
                    "로그인한 회원 정보를 찾을 수 없습니다."
            );
        }

        return member;
    }

    /**
     * 현재 로그인 회원번호 조회
     *
     * @param authentication Spring Security 인증 정보
     * @return member.member_id
     */
    public Long getCurrentMemberId(
            Authentication authentication
    ) {

        /* 로그인 회원 정보에서 회원번호 반환 */
        return getCurrentMember(authentication).getMemberId();
    }
}
