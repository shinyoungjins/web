
package com.portfolio.portfolio.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 보안 설정
 */
@Configuration
public class SecurityConfig {

    /**
     * HTTP 요청 보안 설정
     *
     * 현재는 기존 쇼핑몰 기능을 유지하기 위해
     * 모든 요청을 임시 허용합니다.
     *
     * 카카오 로그인 및 관리자 기능 구현 후
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
                );

        return http.build();
    }
}
