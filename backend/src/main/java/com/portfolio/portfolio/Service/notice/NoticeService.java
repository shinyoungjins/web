
package com.portfolio.portfolio.Service.notice;

import com.portfolio.portfolio.Mapper.notice.NoticeMapper;
import com.portfolio.portfolio.Vo.notice.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 공지사항 Service
 * 공지사항 관련 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
public class NoticeService {

    /** 공지사항 Mapper */
    private final NoticeMapper noticeMapper;

    /**
     * 공지사항 목록 조회
     *
     * @return 사용 중인 공지사항 목록
     */
    @Transactional(readOnly = true)
    public List<NoticeVO> selectNoticeList() {
        return noticeMapper.selectNoticeList();
    }

    /**
     * 공지사항 상세 조회 및 조회수 증가
     *
     * @param noticeId 공지사항 ID
     * @return 조회수가 증가된 공지사항 상세 정보
     */
    @Transactional
    public NoticeVO selectNoticeById(Long noticeId) {

        /* 공지사항 조회수 1 증가 */
        int updatedCount = noticeMapper.updateNoticeViewCount(noticeId);

        /* 존재하지 않거나 사용하지 않는 공지사항 */
        if (updatedCount == 0) {
            return null;
        }

        /* 증가된 조회수를 포함한 상세 정보 조회 */
        return noticeMapper.selectNoticeById(noticeId);
    }
}
