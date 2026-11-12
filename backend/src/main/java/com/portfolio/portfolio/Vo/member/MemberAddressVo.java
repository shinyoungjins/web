package com.portfolio.portfolio.Vo.member;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 회원 배송지 관리 VO
 *
 * 회원별 배송지 등록, 조회, 수정, 삭제 및
 * 기본 배송지 설정에 사용합니다.
 *
 * 배송지 별칭 예시:
 * - A식당
 * - B식당
 * - 집
 */
@Getter
@Setter
public class MemberAddressVo {

    /* 배송지 고유번호 */
    private Long addressId;

    /* 회원 고유번호 */
    private Long memberId;

    /* 배송지 별칭 (A식당, B식당, 집 등) */
    private String addressName;

    /* 수령인 이름 */
    private String recipientName;

    /* 수령인 연락처 */
    private String recipientPhone;

    /* 우편번호 */
    private String zipcode;

    /* 기본 주소 */
    private String address;

    /* 상세 주소 */
    private String addressDetail;

    /* 기본 배송지 여부 */
    private Boolean isDefault;

    /* 배송지 등록일 */
    private LocalDateTime createdAt;

    /* 배송지 수정일 */
    private LocalDateTime updatedAt;
}
