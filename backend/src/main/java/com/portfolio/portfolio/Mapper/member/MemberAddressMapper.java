
package com.portfolio.portfolio.Mapper.member;

import com.portfolio.portfolio.Vo.member.MemberAddressVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 회원 배송지 관리 Mapper
 *
 * 회원별 배송지 조회, 등록, 수정, 삭제 및
 * 기본 배송지 설정 기능을 제공합니다.
 */
@Mapper
public interface MemberAddressMapper {

    /**
     * 회원별 배송지 목록 조회
     *
     * 기본 배송지를 우선 정렬합니다.
     */
    List<MemberAddressVo> selectMemberAddressList(
            @Param("memberId") Long memberId
    );

    /**
     * 배송지 상세 조회
     *
     * 회원번호를 함께 조건으로 사용하여
     * 다른 회원의 배송지 접근을 방지합니다.
     */
    MemberAddressVo selectMemberAddress(
            @Param("memberId") Long memberId,
            @Param("addressId") Long addressId
    );

    /**
     * 회원 배송지 개수 조회
     */
    int countMemberAddresses(
            @Param("memberId") Long memberId
    );

    /**
     * 배송지 등록
     *
     * 등록 후 생성된 addressId를 VO에 저장합니다.
     */
    int insertMemberAddress(
            MemberAddressVo address
    );

    /**
     * 배송지 수정
     *
     * 본인 소유 배송지만 수정할 수 있습니다.
     */
    int updateMemberAddress(
            MemberAddressVo address
    );

    /**
     * 배송지 삭제
     *
     * 본인 소유 배송지만 삭제할 수 있습니다.
     */
    int deleteMemberAddress(
            @Param("memberId") Long memberId,
            @Param("addressId") Long addressId
    );

    /**
     * 회원의 기존 기본 배송지 설정 해제
     */
    int clearDefaultAddress(
            @Param("memberId") Long memberId
    );

    /**
     * 선택한 배송지를 기본 배송지로 설정
     *
     * 회원번호와 배송지번호를 함께 확인합니다.
     */
    int setDefaultAddress(
            @Param("memberId") Long memberId,
            @Param("addressId") Long addressId
    );

}
