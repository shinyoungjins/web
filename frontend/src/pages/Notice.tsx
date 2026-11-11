
import { useEffect, useMemo, useState } from "react";

import { AgGridReact } from "ag-grid-react";

import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
    type ColDef,
    type CellStyle,
} from "ag-grid-community";

import { getNoticeList, type Notice } from "../api/noticeApi";
import "../styles/Notice.css";

/* AG Grid Community 모듈 등록 */
ModuleRegistry.registerModules([AllCommunityModule]);

/* 공지사항 그리드 테마 */
const noticeTheme = themeQuartz.withParams({
    accentColor: "#333333",
    headerBackgroundColor: "#f8f8f8",
    headerTextColor: "#333333",
    rowHoverColor: "#f7f7f7",
    fontFamily: "inherit",
    fontSize: 14,
});

/* 그리드 셀 가운데 정렬 */
const centerCellStyle: CellStyle = {
    textAlign: "center",
};

/* 제목 컬럼 마우스 포인터 */
const titleCellStyle: CellStyle = {
    cursor: "pointer",
};

export default function NoticePage() {

    /* 공지사항 목록 */
    const [noticeList, setNoticeList] = useState<Notice[]>([]);

    /* 검색어 */
    const [searchText, setSearchText] = useState("");

    /* 로딩 및 오류 상태 */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /**
     * 공지사항 목록 조회
     */
    useEffect(() => {
        let active = true;

        async function loadNotices() {
            try {
                const data = await getNoticeList();

                if (active) {
                    setNoticeList(data);
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

        loadNotices();

        return () => {
            active = false;
        };
    }, []);

    /**
     * 그리드 컬럼 설정
     */
    const columnDefs = useMemo<ColDef<Notice>[]>(
        () => [
            {
                headerName: "번호",
                field: "noticeId",
                width: 110,
                sortable: true,
                filter: false,
                cellStyle: centerCellStyle,
            },
            {
                headerName: "제목",
                field: "title",
                flex: 1,
                minWidth: 250,
                sortable: true,
                filter: true,
                cellStyle: titleCellStyle,

                /* 공지사항 제목 클릭 시 상세 페이지 이동 */
                onCellClicked: (params) => {
                    if (params.data) {
                        window.location.href =
                            `/notice/${params.data.noticeId}`;
                    }
                },
            },
            {
                headerName: "작성일",
                field: "createdAt",
                width: 180,
                sortable: true,
                filter: false,

                /* 날짜 형식 변환 */
                valueFormatter: (params) => {
                    if (!params.value) {
                        return "";
                    }

                    return String(params.value).slice(0, 10);
                },

                cellStyle: centerCellStyle,
            },
            {
                headerName: "조회수",
                field: "viewCount",
                width: 120,
                sortable: true,
                filter: false,
                cellStyle: centerCellStyle,
            },
        ],
        []
    );

    return (
        <section className="notice-page">

            {/* 공지사항 상단 제목 */}
            <div className="notice-header">
                <h1>공지사항</h1>
                <p>
                    쇼핑몰의 새로운 소식과 안내사항을 확인해 주세요.
                </p>
            </div>

            {/* 공지사항 검색 */}
            <div className="notice-toolbar">
                <input
                    type="text"
                    placeholder="공지사항 제목 검색"
                    value={searchText}
                    onChange={(event) =>
                        setSearchText(event.target.value)
                    }
                />
            </div>

            {/* API 오류 메시지 */}
            {error && (
                <p className="notice-error">
                    {error}
                </p>
            )}

            {/* 공지사항 그리드 */}
            <div className="notice-grid">
                <AgGridReact<Notice>
                    theme={noticeTheme}
                    rowData={noticeList}
                    columnDefs={columnDefs}
                    loading={loading}
                    quickFilterText={searchText}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 20, 50]}
                    rowHeight={52}
                    headerHeight={48}
                    domLayout="autoHeight"
                    overlayNoRowsTemplate="등록된 공지사항이 없습니다."
                />
            </div>

        </section>
    );
}
