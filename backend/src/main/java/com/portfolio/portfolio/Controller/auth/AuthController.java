
package com.portfolio.portfolio.Controller.auth;

import com.portfolio.portfolio.Service.auth.SocialMemberService;
import com.portfolio.portfolio.Vo.auth.SocialMemberVo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 소셜 로그인 공통 인증 컨트롤러
 *
 * 카카오, 네이버, 구글 로그인 사용자 정보를
 * 공통 API로 관리합니다.
 */
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final SocialMemberService socialMemberService;

    /**
     * 로그인 제공자와 사용자 ID 조회
     *
     * 카카오: OIDC 사용자 정보
     * 네이버: OAuth2 response 내부 사용자 정보
     * 구글: OIDC 사용자 정보
     *
     * 반환값:
     * [0] 로그인 제공자
     * [1] 제공자 사용자 고유 ID
     */
    private String[] getSocialUserInfo(Authentication authentication) {

        /* 로그인하지 않은 사용자 */
        if (!(authentication instanceof OAuth2AuthenticationToken token)
                || !authentication.isAuthenticated()) {
            return null;
        }

        String registrationId =
                token.getAuthorizedClientRegistrationId();

        Object principal = authentication.getPrincipal();

        /* 카카오 로그인 */
        if ("kakao".equalsIgnoreCase(registrationId)) {

            if (!(principal instanceof OidcUser user)) {
                throw new IllegalStateException(
                        "카카오 사용자 정보를 확인할 수 없습니다."
                );
            }

            return new String[]{
                    "KAKAO",
                    user.getSubject()
            };
        }

        /* 네이버 로그인 */
        if ("naver".equalsIgnoreCase(registrationId)) {

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

            if (!(id instanceof String providerUserId)
                    || providerUserId.isBlank()) {
                throw new IllegalStateException(
                        "네이버 사용자 고유 ID를 확인할 수 없습니다."
                );
            }

            return new String[]{
                    "NAVER",
                    providerUserId
            };
        }

        /* 구글 로그인 */
        if ("google".equalsIgnoreCase(registrationId)) {

            if (!(principal instanceof OidcUser user)) {
                throw new IllegalStateException(
                        "구글 사용자 정보를 확인할 수 없습니다."
                );
            }

            return new String[]{
                    "GOOGLE",
                    user.getSubject()
            };
        }

        /* 지원하지 않는 로그인 제공자 */
        throw new IllegalStateException(
                "지원하지 않는 소셜 로그인 제공자입니다."
        );
    }

    /**
     * 현재 로그인한 소셜 사용자 정보 조회
     *
     * GET /api/auth/me
     */
    @GetMapping("/api/auth/me")
    public Map<String, Object> getCurrentUser(
            Authentication authentication
    ) {
        Map<String, Object> result = new HashMap<>();

        /* 로그인하지 않은 사용자 */
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication instanceof OAuth2AuthenticationToken)) {
            result.put("authenticated", false);
            return result;
        }

        /* 로그인 제공자 및 사용자 ID 확인 */
        String[] socialUserInfo = getSocialUserInfo(authentication);

        String provider = socialUserInfo[0];
        String providerUserId = socialUserInfo[1];

        /* DB에 저장된 회원 정보 조회 */
        SocialMemberVo member = socialMemberService.getSocialMember(
                provider,
                providerUserId
        );

        /* DB에서 회원을 찾지 못한 경우 */
        if (member == null) {
            result.put("authenticated", false);
            return result;
        }

        /* 로그인한 회원 정보 */
        result.put("authenticated", true);
        result.put("memberId", member.getMemberId());
        result.put("memberName", member.getMemberName());
        result.put("email", member.getEmail());
        result.put("phone", member.getPhone());
        result.put("role", member.getRole());
        result.put("provider", member.getProvider());

        return result;
    }

    /**
     * 로그인한 회원 정보 수정
     *
     * PUT /api/auth/me
     *
     * 회원 이름, 연락처, 이메일 수정
     */
    @PutMapping("/api/auth/me")
    public ResponseEntity<Map<String, Object>> updateCurrentUser(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {

        Map<String, Object> result = new HashMap<>();

        /* 로그인하지 않은 사용자 */
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication instanceof OAuth2AuthenticationToken)) {

            result.put("success", false);
            result.put("message", "로그인이 필요합니다.");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(result);
        }

        /* 로그인 제공자 및 사용자 ID 확인 */
        String[] socialUserInfo = getSocialUserInfo(authentication);

        String provider = socialUserInfo[0];
        String providerUserId = socialUserInfo[1];

        /* 요청한 회원 정보 */
        String memberName = request.get("memberName");
        String phone = request.get("phone");
        String email = request.get("email");

        try {

            /* 로그인한 회원의 정보 수정 */
            SocialMemberVo member = socialMemberService.updateMemberProfile(
                    provider,
                    providerUserId,
                    memberName,
                    phone,
                    email
            );

            /* 수정 완료된 회원 정보 반환 */
            result.put("success", true);
            result.put("message", "회원 정보가 수정되었습니다.");
            result.put("memberId", member.getMemberId());
            result.put("memberName", member.getMemberName());
            result.put("email", member.getEmail());
            result.put("phone", member.getPhone());
            result.put("role", member.getRole());
            result.put("provider", member.getProvider());

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {

            /* 입력값 검증 실패 */
            result.put("success", false);
            result.put("message", e.getMessage());

            return ResponseEntity
                    .badRequest()
                    .body(result);

        } catch (IllegalStateException e) {

            /* 회원 정보 조회 또는 수정 실패 */
            result.put("success", false);
            result.put("message", "회원 정보를 수정할 수 없습니다.");

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(result);
        }
    }
}
