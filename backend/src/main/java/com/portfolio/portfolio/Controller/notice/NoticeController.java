
package com.portfolio.portfolio.Controller.notice;

import com.portfolio.portfolio.Service.notice.NoticeService;
import com.portfolio.portfolio.Vo.notice.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 공지사항 Controller
 * 공지사항 관련 REST API 요청을 처리합니다.
 */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    /** 공지사항 Service */
    private final NoticeService noticeService;

    /**
     * 공지사항 목록 조회 API
     *
     * GET /api/notices
     *
     * @return 사용 중인 공지사항 목록
     */
    @GetMapping
    public ResponseEntity<List<NoticeVO>> selectNoticeList() {

        List<NoticeVO> noticeList = noticeService.selectNoticeList();

        return ResponseEntity.ok(noticeList);
    }

    /**
     * 공지사항 상세 조회 API
     *
     * GET /api/notices/{noticeId}
     *
     * @param noticeId 공지사항 ID
     * @return 공지사항 상세 정보
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeVO> selectNoticeById(
            @PathVariable Long noticeId) {

        NoticeVO notice = noticeService.selectNoticeById(noticeId);

        // 해당 공지사항이 존재하지 않는 경우 404 반환
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(notice);
    }
}
