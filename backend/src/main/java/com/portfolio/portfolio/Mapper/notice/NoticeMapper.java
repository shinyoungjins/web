
package com.portfolio.portfolio.Mapper.notice;

import com.portfolio.portfolio.Vo.notice.NoticeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 공지사항 Mapper
 * 공지사항 데이터베이스 조회 및 수정을 담당합니다.
 */
@Mapper
public interface NoticeMapper {

    /**
     * 공지사항 목록 조회
     *
     * @return 사용 중인 공지사항 목록
     */
    List<NoticeVO> selectNoticeList();

    /**
     * 공지사항 상세 조회
     *
     * @param noticeId 공지사항 ID
     * @return 공지사항 상세 정보
     */
    NoticeVO selectNoticeById(@Param("noticeId") Long noticeId);

    /**
     * 공지사항 조회수 증가
     *
     * @param noticeId 공지사항 ID
     * @return 수정된 행 개수
     */
    int updateNoticeViewCount(@Param("noticeId") Long noticeId);
}
