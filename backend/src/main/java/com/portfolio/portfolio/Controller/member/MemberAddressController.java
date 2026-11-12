
package com.portfolio.portfolio.Controller.member;

import com.portfolio.portfolio.Service.auth.CurrentMemberService;
import com.portfolio.portfolio.Service.member.MemberAddressService;
import com.portfolio.portfolio.Vo.member.MemberAddressVo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 회원 배송지 관리 Controller
 *
 * - 로그인 회원 배송지 목록 조회
 * - 배송지 상세 조회
 * - 배송지 등록, 수정, 삭제
 * - 기본 배송지 변경
 *
 * 모든 배송지 API는 현재 로그인 회원을 기준으로 처리합니다.
 */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class MemberAddressController {

    private final MemberAddressService memberAddressService;
    private final CurrentMemberService currentMemberService;

    /**
     * 회원별 배송지 목록 조회
     *
     * GET /api/addresses
     */
    @GetMapping
    public ResponseEntity<List<MemberAddressVo>> getAddressList(
            Authentication authentication
    ) {

        /* 현재 로그인 회원번호 조회 */
        Long memberId =
                currentMemberService.getCurrentMemberId(authentication);

        /* 회원별 배송지 목록 조회 */
        List<MemberAddressVo> addresses =
                memberAddressService.getMemberAddressList(memberId);

        return ResponseEntity.ok(addresses);
    }

    /**
     * 배송지 상세 조회
     *
     * GET /api/addresses/{addressId}
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<MemberAddressVo> getAddress(
            Authentication authentication,
            @PathVariable Long addressId
    ) {

        /* 현재 로그인 회원번호 조회 */
        Long memberId =
                currentMemberService.getCurrentMemberId(authentication);

        /* 본인 배송지 상세 조회 */
        MemberAddressVo address =
                memberAddressService.getMemberAddress(
                        memberId,
                        addressId
                );

        return ResponseEntity.ok(address);
    }

    /**
     * 배송지 등록
     *
     * POST /api/addresses
     *
     * 첫 번째 배송지는 자동으로 기본 배송지로 설정됩니다.
     */
    @PostMapping
    public ResponseEntity<MemberAddressVo> createAddress(
            Authentication authentication,
            @RequestBody MemberAddressVo request
    ) {

        /* 현재 로그인 회원번호 조회 */
        Long memberId =
                currentMemberService.getCurrentMemberId(authentication);

        /* 배송지 등록 */
        MemberAddressVo createdAddress =
                memberAddressService.createMemberAddress(
                        memberId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdAddress);
    }

    /**
     * 배송지 수정
     *
     * PUT /api/addresses/{addressId}
     *
     * 배송지 별칭, 수령인, 연락처, 주소를 수정합니다.
     * 기본 배송지 변경은 별도 API에서 처리합니다.
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<MemberAddressVo> updateAddress(
            Authentication authentication,
            @PathVariable Long addressId,
            @RequestBody MemberAddressVo request
    ) {

        /* 현재 로그인 회원번호 조회 */
        Long memberId =
                currentMemberService.getCurrentMemberId(authentication);

        /* 본인 배송지 정보 수정 */
        MemberAddressVo updatedAddress =
                memberAddressService.updateMemberAddress(
                        memberId,
                        addressId,
                        request
                );

        return ResponseEntity.ok(updatedAddress);
    }

    /**
     * 배송지 삭제
     *
     * DELETE /api/addresses/{addressId}
     *
     * 기본 배송지를 삭제하면 남은 배송지 중
     * 하나를 자동으로 기본 배송지로 지정합니다.
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            Authentication authentication,
            @PathVariable Long addressId
    ) {

        /* 현재 로그인 회원번호 조회 */
        Long memberId =
                currentMemberService.getCurrentMemberId(authentication);

        /* 본인 배송지 삭제 */
        memberAddressService.deleteMemberAddress(
                memberId,
                addressId
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * 기본 배송지 변경
     *
     * PATCH /api/addresses/{addressId}/default
     */
    @PatchMapping("/{addressId}/default")
    public ResponseEntity<MemberAddressVo> changeDefaultAddress(
            Authentication authentication,
            @PathVariable Long addressId
    ) {

        /* 현재 로그인 회원번호 조회 */
        Long memberId =
                currentMemberService.getCurrentMemberId(authentication);

        /* 기본 배송지 변경 */
        MemberAddressVo defaultAddress =
                memberAddressService.changeDefaultAddress(
                        memberId,
                        addressId
                );

        return ResponseEntity.ok(defaultAddress);
    }

    /**
     * 배송지 입력값 오류 처리
     *
     * 잘못된 배송지 정보 또는
     * 존재하지 않는 배송지 조회 시 400 반환
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException e
    ) {

        return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
        );
    }

    /**
     * 로그인 및 회원 정보 오류 처리
     *
     * 인증 정보가 없거나
     * 로그인 회원을 확인할 수 없는 경우 401 반환
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(
            IllegalStateException e
    ) {

        /*
         * 인증 실패와 일반 처리 실패를 구분합니다.
         * 인증 관련 오류만 401로 반환합니다.
         */
        String message = e.getMessage();

        if ("로그인이 필요합니다.".equals(message)
                || "로그인한 회원 정보를 찾을 수 없습니다.".equals(message)
                || (message != null
                && message.contains("사용자 정보를 확인할 수 없습니다"))
                || (message != null
                && message.contains("사용자 고유 ID를 확인할 수 없습니다"))) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "로그인 회원 정보를 확인할 수 없습니다."
                    ));
        }

        /* 그 외 서비스 처리 오류 */
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "message", message == null
                                ? "배송지 처리 중 오류가 발생했습니다."
                                : message
                ));
    }
}
