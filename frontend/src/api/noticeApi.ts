
/**
 * 공지사항 데이터 타입
 */
export interface Notice {
    noticeId: number;
    title: string;
    content: string;
    viewCount: number;
    useYn: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * 공지사항 목록 조회 API
 *
 * GET /api/notices
 */
export async function getNoticeList(): Promise<Notice[]> {
    const response = await fetch("/api/notices");

    // API 호출 실패 시 예외 처리
    if (!response.ok) {
        throw new Error("공지사항 목록을 불러오지 못했습니다.");
    }

    return response.json();
}

/**
 * 공지사항 상세 조회 API
 *
 * GET /api/notices/{noticeId}
 */
export async function getNoticeById(
    noticeId: number
): Promise<Notice> {
    const response = await fetch(`/api/notices/${noticeId}`);

    // API 호출 실패 시 예외 처리
    if (!response.ok) {
        throw new Error("공지사항 상세 정보를 불러오지 못했습니다.");
    }

    return response.json();
}
