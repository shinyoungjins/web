package com.portfolio.portfolio.Vo.notice;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * 공지사항 정보 VO
 */
@Getter
@Setter
public class NoticeVO {

    /** 공지사항 ID */
    private Long noticeId;

    /** 공지사항 제목 */
    private String title;

    /** 공지사항 내용 */
    private String content;

    /** 조회수 */
    private Integer viewCount;

    /** 사용 여부 (Y/N) */
    private String useYn;

    /** 등록 일시 */
    private LocalDateTime createdAt;

    /** 수정 일시 */
    private LocalDateTime updatedAt;
}