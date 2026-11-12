
package com.portfolio.portfolio.Service.member;

import com.portfolio.portfolio.Mapper.member.MemberAddressMapper;
import com.portfolio.portfolio.Vo.member.MemberAddressVo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 회원 배송지 관리 서비스
 *
 * - 배송지 목록 및 상세 조회
 * - 배송지 등록, 수정, 삭제
 * - 기본 배송지 설정
 * - 회원별 배송지 접근 권한 확인
 */
@Service
@RequiredArgsConstructor
public class MemberAddressService {

    private final MemberAddressMapper memberAddressMapper;

    /**
     * 회원별 배송지 목록 조회
     *
     * 기본 배송지를 가장 먼저 반환합니다.
     */
    @Transactional(readOnly = true)
    public List<MemberAddressVo> getMemberAddressList(Long memberId) {

        validateMemberId(memberId);

        return memberAddressMapper.selectMemberAddressList(memberId);
    }

    /**
     * 배송지 상세 조회
     *
     * 로그인 회원 소유의 배송지만 조회합니다.
     */
    @Transactional(readOnly = true)
    public MemberAddressVo getMemberAddress(
            Long memberId,
            Long addressId
    ) {

        validateMemberId(memberId);

        MemberAddressVo address =
                memberAddressMapper.selectMemberAddress(
                        memberId,
                        addressId
                );

        if (address == null) {
            throw new IllegalArgumentException(
                    "배송지 정보를 찾을 수 없습니다."
            );
        }

        return address;
    }

    /**
     * 배송지 등록
     *
     * - 첫 배송지는 자동으로 기본 배송지 지정
     * - 기본 배송지 요청 시 기존 기본 배송지 해제
     * - 등록 및 기본 배송지 변경을 트랜잭션으로 처리
     */
    @Transactional
    public MemberAddressVo createMemberAddress(
            Long memberId,
            MemberAddressVo address
    ) {

        validateMemberId(memberId);
        validateAddress(address);

        /* 클라이언트가 전달한 회원번호 대신 로그인 회원번호 사용 */
        address.setMemberId(memberId);

        /* 신규 등록이므로 배송지번호 초기화 */
        address.setAddressId(null);

        /* 기존 배송지 개수 조회 */
        int addressCount =
                memberAddressMapper.countMemberAddresses(memberId);

        /* 첫 배송지 또는 기본 배송지 지정 요청 여부 */
        boolean setAsDefault =
                addressCount == 0
                        || Boolean.TRUE.equals(address.getIsDefault());

        /*
         * 기존 기본 배송지 해제
         *
         * 기본 배송지 중복 방지를 위해
         * 새 배송지 등록 전에 처리합니다.
         */
        if (setAsDefault) {
            memberAddressMapper.clearDefaultAddress(memberId);
        }

        /* 신규 배송지 기본 여부 설정 */
        address.setIsDefault(setAsDefault);

        /* 배송지 등록 */
        int insertedRows =
                memberAddressMapper.insertMemberAddress(address);

        if (insertedRows != 1 || address.getAddressId() == null) {
            throw new IllegalStateException(
                    "배송지 등록에 실패했습니다."
            );
        }

        return getMemberAddress(memberId, address.getAddressId());
    }

    /**
     * 배송지 수정
     *
     * - 본인 소유 배송지만 수정
     * - 배송지 기본 정보 변경
     * - 기본 배송지 변경은 별도 API에서 처리
     */
    @Transactional
    public MemberAddressVo updateMemberAddress(
            Long memberId,
            Long addressId,
            MemberAddressVo address
    ) {

        validateMemberId(memberId);
        validateAddress(address);

        /* 수정 대상 배송지 소유권 확인 */
        getMemberAddress(memberId, addressId);

        /* 실제 로그인 회원 및 수정 대상 배송지번호 지정 */
        address.setMemberId(memberId);
        address.setAddressId(addressId);

        /* 배송지 정보 수정 */
        int updatedRows =
                memberAddressMapper.updateMemberAddress(address);

        if (updatedRows != 1) {
            throw new IllegalStateException(
                    "배송지 수정에 실패했습니다."
            );
        }

        return getMemberAddress(memberId, addressId);
    }

    /**
     * 배송지 삭제
     *
     * - 본인 소유 배송지만 삭제
     * - 기본 배송지를 삭제한 경우 남은 배송지 중
     *   가장 최근 등록한 배송지를 기본 배송지로 지정
     */
    @Transactional
    public void deleteMemberAddress(
            Long memberId,
            Long addressId
    ) {

        validateMemberId(memberId);

        /* 삭제 대상 배송지 조회 및 소유권 확인 */
        MemberAddressVo target =
                getMemberAddress(memberId, addressId);

        /* 배송지 삭제 */
        int deletedRows =
                memberAddressMapper.deleteMemberAddress(
                        memberId,
                        addressId
                );

        if (deletedRows != 1) {
            throw new IllegalStateException(
                    "배송지 삭제에 실패했습니다."
            );
        }

        /* 기본 배송지를 삭제한 경우 */
        if (Boolean.TRUE.equals(target.getIsDefault())) {

            /* 남아 있는 배송지 목록 조회 */
            List<MemberAddressVo> remainingAddresses =
                    memberAddressMapper.selectMemberAddressList(memberId);

            if (!remainingAddresses.isEmpty()) {

                /* 가장 최근 등록된 배송지를 기본 배송지로 지정 */
                MemberAddressVo nextDefault =
                        remainingAddresses.get(0);

                int updatedRows =
                        memberAddressMapper.setDefaultAddress(
                                memberId,
                                nextDefault.getAddressId()
                        );

                if (updatedRows != 1) {
                    throw new IllegalStateException(
                            "기본 배송지 재설정에 실패했습니다."
                    );
                }
            }
        }
    }

    /**
     * 기본 배송지 변경
     *
     * - 본인 배송지 여부 확인
     * - 기존 기본 배송지 해제
     * - 선택한 배송지를 기본 배송지로 지정
     *
     * 전체 작업을 하나의 트랜잭션으로 처리합니다.
     */
    @Transactional
    public MemberAddressVo changeDefaultAddress(
            Long memberId,
            Long addressId
    ) {

        validateMemberId(memberId);

        /* 변경 대상 배송지 소유권 확인 */
        MemberAddressVo target =
                getMemberAddress(memberId, addressId);

        /* 이미 기본 배송지인 경우 그대로 반환 */
        if (Boolean.TRUE.equals(target.getIsDefault())) {
            return target;
        }

        /* 기존 기본 배송지 설정 해제 */
        memberAddressMapper.clearDefaultAddress(memberId);

        /* 선택한 배송지를 기본 배송지로 설정 */
        int updatedRows =
                memberAddressMapper.setDefaultAddress(
                        memberId,
                        addressId
                );

        if (updatedRows != 1) {
            throw new IllegalStateException(
                    "기본 배송지 설정에 실패했습니다."
            );
        }

        return getMemberAddress(memberId, addressId);
    }

    /**
     * 회원번호 검증
     */
    private void validateMemberId(Long memberId) {

        if (memberId == null || memberId <= 0) {
            throw new IllegalArgumentException(
                    "올바른 회원 정보가 필요합니다."
            );
        }
    }

    /**
     * 배송지 필수 입력값 검증
     *
     * DB 컬럼 길이와 필수 여부를 기준으로 검증합니다.
     */
    private void validateAddress(MemberAddressVo address) {

        if (address == null) {
            throw new IllegalArgumentException(
                    "배송지 정보가 필요합니다."
            );
        }

        validateRequiredText(
                address.getAddressName(), 100, "배송지 별칭"
        );

        validateRequiredText(
                address.getRecipientName(), 100, "수령인 이름"
        );

        validateRequiredText(
                address.getRecipientPhone(), 30, "수령인 연락처"
        );

        validateRequiredText(
                address.getZipcode(), 10, "우편번호"
        );

        validateRequiredText(
                address.getAddress(), 255, "주소"
        );

        /* 상세 주소는 선택 입력 */
        if (address.getAddressDetail() != null
                && address.getAddressDetail().length() > 255) {
            throw new IllegalArgumentException(
                    "상세 주소는 255자 이내로 입력해 주세요."
            );
        }
    }

    /**
     * 필수 문자열 및 최대 길이 검증
     */
    private void validateRequiredText(
            String value,
            int maxLength,
            String fieldName
    ) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + "을(를) 입력해 주세요."
            );
        }

        if (value.length() > maxLength) {
            throw new IllegalArgumentException(
                    fieldName + "은(는) "
                            + maxLength + "자 이내로 입력해 주세요."
            );
        }
    }
}
