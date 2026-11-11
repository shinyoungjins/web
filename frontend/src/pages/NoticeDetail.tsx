
import { useEffect, useState } from "react";

import {
    getNoticeById,
    type Notice,
} from "../api/noticeApi";

import "../styles/NoticeDetail.css";

/**
 * 공지사항 상세 페이지
 */
export default function NoticeDetail() {

    /* URL에서 공지사항 ID 추출 */
    const pathname = window.location.pathname;
    const noticeId = Number(
        pathname.split("/").filter(Boolean).pop()
    );

    /* 공지사항 상세 정보 */
    const [notice, setNotice] = useState<Notice | null>(null);

    /* 로딩 및 오류 상태 */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /**
     * 공지사항 상세 조회
     */
    useEffect(() => {
        let active = true;

        async function loadNotice() {
            try {
                /* 공지사항 ID 유효성 확인 */
                if (!Number.isSafeInteger(noticeId) || noticeId <= 0) {
                    throw new Error("잘못된 공지사항 번호입니다.");
                }

                /* 공지사항 상세 API 호출 */
                const data = await getNoticeById(noticeId);

                if (active) {
                    setNotice(data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "공지사항 조회 중 오류가 발생했습니다."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadNotice();

        return () => {
            active = false;
        };
    }, [noticeId]);

    /**
     * 날짜 표시 형식 변환
     */
    const formatDate = (date?: string) => {
        if (!date) return "-";

        return date.slice(0, 10);
    };

    /**
     * 공지사항 목록으로 이동
     */
    const moveToList = () => {
        window.location.href = "/notice";
    };

    return (
        <section className="notice-detail-page">

            {/* 공지사항 페이지 상단 제목 */}
            <div className="notice-detail-header">
                <h1>공지사항</h1>
                <p>쇼핑몰의 새로운 소식과 안내사항을 확인해 주세요.</p>
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="notice-detail-status">
                    공지사항을 불러오는 중입니다.
                </div>
            )}

            {/* 오류 상태 */}
            {!loading && error && (
                <div className="notice-detail-status notice-detail-error">
                    <p>{error}</p>
                    <button type="button" onClick={moveToList}>
                        목록으로
                    </button>
                </div>
            )}

            {/* 공지사항 상세 내용 */}
            {!loading && !error && notice && (
                <>
                    {/* 공지사항 제목 및 정보 */}
                    <div className="notice-detail-info">
                        <h2>{notice.title}</h2>

                        <div className="notice-detail-meta">
                            <span>작성일 {formatDate(notice.createdAt)}</span>
                            <span>조회수 {notice.viewCount}</span>
                        </div>
                    </div>

                    {/* 공지사항 본문 */}
                    <div className="notice-detail-content">
                        {notice.content}
                    </div>

                    {/* 하단 버튼 */}
                    <div className="notice-detail-actions">
                        <button
                            type="button"
                            onClick={moveToList}
                        >
                            목록으로
                        </button>
                    </div>
                </>
            )}

        </section>
    );
}
