
package com.portfolio.portfolio.config;

import com.portfolio.portfolio.Service.auth.SocialMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Map;

/**
 * Spring Security 보안 설정
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final SocialMemberService socialMemberService;

    /**
     * HTTP 요청 보안 설정
     *
     * 현재는 기존 쇼핑몰 기능을 유지하기 위해
     * 모든 요청을 임시 허용합니다.
     *
     * 카카오, 네이버 로그인 및 관리자 기능 구현 후
     * URL별 접근 권한을 설정할 예정입니다.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                /* 기존 API 테스트를 위한 임시 CSRF 비활성화 */
                .csrf(csrf -> csrf.disable())

                /* 모든 요청 임시 허용 */
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )

                /* 소셜 OAuth2 / OIDC 로그인 활성화 */
                .oauth2Login(oauth2 -> oauth2
                        .successHandler((request, response, authentication) -> {

                            /* 로그인한 소셜 사용자 정보 */
                            Object principal = authentication.getPrincipal();

                            if (!(authentication instanceof OAuth2AuthenticationToken token)) {
                                throw new IllegalStateException(
                                        "소셜 로그인 인증 정보를 확인할 수 없습니다."
                                );
                            }

                            /* 로그인 제공자 구분 */
                            String registrationId =
                                    token.getAuthorizedClientRegistrationId();

                            String provider;
                            String providerUserId;
                            String memberName;
                            String email;

                            if ("kakao".equalsIgnoreCase(registrationId)) {

                                /* 카카오 OIDC 로그인 */
                                if (!(principal instanceof OidcUser user)) {
                                    throw new IllegalStateException(
                                            "카카오 OIDC 사용자 정보를 확인할 수 없습니다."
                                    );
                                }

                                provider = "KAKAO";
                                providerUserId = user.getSubject();
                                memberName = user.getClaimAsString("nickname");
                                email = user.getClaimAsString("email");

                            } else if ("naver".equalsIgnoreCase(registrationId)) {

                                /* 네이버 OAuth2 로그인 */
                                if (!(principal instanceof OAuth2User user)) {
                                    throw new IllegalStateException(
                                            "네이버 OAuth2 사용자 정보를 확인할 수 없습니다."
                                    );
                                }

                                /* 네이버 사용자 정보는 response 내부에 존재 */
                                Object responseObject =
                                        user.getAttribute("response");

                                if (!(responseObject instanceof Map<?, ?> naverUser)) {
                                    throw new IllegalStateException(
                                            "네이버 사용자 정보를 확인할 수 없습니다."
                                    );
                                }

                                provider = "NAVER";

                                providerUserId =
                                        (String) naverUser.get("id");

                                memberName =
                                        (String) naverUser.get("name");

                                /* 이름이 없으면 별명 사용 */
                                if (memberName == null || memberName.isBlank()) {
                                    memberName =
                                            (String) naverUser.get("nickname");
                                }

                                email =
                                        (String) naverUser.get("email");

                            }  else if ("google".equalsIgnoreCase(registrationId)) {

                                if (!(principal instanceof OidcUser user)) {
                                    throw new IllegalStateException("구글 사용자 정보를 확인할 수 없습니다.");
                                }

                                provider = "GOOGLE";
                                providerUserId = user.getSubject();
                                memberName = user.getClaimAsString("name");
                                email = user.getClaimAsString("email");

                            } else {
                                throw new IllegalStateException("지원하지 않는 로그인 제공자입니다.");
                            }

                            /* 회원 이름이 없는 경우 기본값 설정 */
                            if (memberName == null || memberName.isBlank()) {
                                memberName = "회원";
                            }

                            /* DB 회원 조회 또는 신규 등록 */
                            socialMemberService.findOrCreateMember(
                                    provider,
                                    providerUserId,
                                    memberName,
                                    email
                            );

                            /* 회원 처리 완료 후 React 홈 화면 이동 */
                            response.sendRedirect("http://localhost:5173/");
                        })
                )

                /**
                 * 로그아웃 설정
                 *
                 * Spring Security 세션 종료
                 * 인증 정보 삭제
                 * JSESSIONID 쿠키 삭제
                 * 로그아웃 후 React 홈 화면 이동
                 */
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessUrl("http://localhost:5173/")
                        .permitAll()
                );

        return http.build();
    }
}
