
import { useEffect, useState } from "react";
import "../styles/MyPage.css";

/* 로그인 회원 정보 */
interface MemberInfo {
    authenticated: boolean;
    memberId: number;
    memberName: string;
    email: string | null;
    phone: string | null;
    role: string;
    provider: string;
}

/* 배송지 정보 */
interface MemberAddress {
    addressId: number;
    memberId: number;
    addressName: string;
    recipientName: string;
    recipientPhone: string;
    zipcode: string;
    address: string;
    addressDetail: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

/* 배송지 등록 및 수정 요청 */
interface AddressForm {
    addressName: string;
    recipientName: string;
    recipientPhone: string;
    zipcode: string;
    address: string;
    addressDetail: string;
    isDefault: boolean;
}

/* 회원별 미수금 조회 결과 */
interface ReceivableInfo {
    memberId: number;
    memberName: string;
    totalCreditAmount: number;
    totalPaidAmount: number;
    receivableAmount: number;
    availableCreditAmount: number;
}

/* 과거 주문 내역 */
interface OrderHistory {
    orderId: number;
    orderNo: string;
    memberId: number;
    addressId: number;
    addressName: string;
    orderStatus: string;
    paymentType: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
}

/* 과거 주문 상품 상세 */
interface OrderItem {
    orderItemId: number;
    orderId: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

/* 회원 정보 수정 API 응답 */
interface UpdateMemberResponse {
    success: boolean;
    message: string;
    memberId?: number;
    memberName?: string;
    email?: string | null;
    phone?: string | null;
    role?: string;
    provider?: string;
}

/* 배송지 초기 입력값 */
const emptyAddressForm: AddressForm = {
    addressName: "",
    recipientName: "",
    recipientPhone: "",
    zipcode: "",
    address: "",
    addressDetail: "",
    isDefault: false,
};

/**
 * 금액을 원화 형식으로 변환
 */
function formatWon(amount: number): string {
    return `${Number(amount).toLocaleString("ko-KR")}원`;
}

/**
 * 주문일시 표시
 */
function formatOrderDate(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("ko-KR");
}

/**
 * 소셜 로그인 제공자 이름 변환
 */
function getProviderName(provider: string): string {
    switch (provider?.toUpperCase()) {
        case "KAKAO":
            return "카카오";
        case "NAVER":
            return "네이버";
        case "GOOGLE":
            return "구글";
        default:
            return provider || "-";
    }
}

/**
 * 마이페이지
 *
 * - 로그인 회원 정보 조회 및 수정
 * - 회원별 배송지 관리
 * - 미수금 현황 조회
 * - 배송지별 과거 주문 조회
 * - 주문별 상품 상세 조회
 * - 간편 재주문 화면
 */
export default function MyPage() {

    /* 로그인 회원 정보 */
    const [user, setUser] = useState<MemberInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* 마이페이지 상단 탭 */
    const [activeTab, setActiveTab] =
        useState<"member" | "order">("member");

    /* 회원 정보 수정 상태 */
    const [editing, setEditing] = useState(false);
    const [memberName, setMemberName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    /* 저장 상태 및 결과 메시지 */
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");

    /* 배송지 관리 상태 */
    const [addresses, setAddresses] =
        useState<MemberAddress[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [addressError, setAddressError] = useState("");
    const [addressMessage, setAddressMessage] = useState("");

    /* 배송지 점 3개 메뉴 */
    const [openAddressMenu, setOpenAddressMenu] =
        useState<number | null>(null);

    /* 배송지 등록 및 수정 */
    const [editingAddressId, setEditingAddressId] =
        useState<number | "new" | null>(null);

    const [addressForm, setAddressForm] =
        useState<AddressForm>({ ...emptyAddressForm });

    const [addressSaving, setAddressSaving] = useState(false);

    /* 미수금 관리 */
    const [receivable, setReceivable] =
        useState<ReceivableInfo | null>(null);

    const [receivableLoading, setReceivableLoading] =
        useState(false);

    const [receivableError, setReceivableError] = useState("");

    /* 재주문 배송지 선택 */
    const [selectedAddressId, setSelectedAddressId] = useState("");

    /* 과거 주문 목록 */
    const [orderHistory, setOrderHistory] =
        useState<OrderHistory[]>([]);

    const [orderHistoryLoading, setOrderHistoryLoading] =
        useState(false);

    const [orderHistoryError, setOrderHistoryError] = useState("");

    /* 선택한 과거 주문 */
    const [selectedOrderId, setSelectedOrderId] = useState("");

    /* 주문 상품 상세 */
    const [orderItems, setOrderItems] =
        useState<OrderItem[]>([]);

    const [orderItemsLoading, setOrderItemsLoading] =
        useState(false);

    const [orderItemsError, setOrderItemsError] = useState("");

    /**
     * 로그인한 회원 정보 조회
     *
     * GET /api/auth/me
     */
    const loadMember = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("회원 정보를 불러오지 못했습니다.");
            }

            const data: MemberInfo = await response.json();

            /* 로그인하지 않은 경우 로그인 페이지 이동 */
            if (!data.authenticated) {
                window.location.href = "/login";
                return;
            }

            setUser(data);
            setMemberName(data.memberName ?? "");
            setPhone(data.phone ?? "");
            setEmail(data.email ?? "");

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "회원 정보를 불러오는 중 오류가 발생했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * 회원별 배송지 목록 조회
     *
     * GET /api/addresses
     */
    const loadAddresses = async () => {
        setAddressLoading(true);
        setAddressError("");

        try {
            const response = await fetch("/api/addresses", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(
                    "배송지 목록을 불러오지 못했습니다."
                );
            }

            const data: MemberAddress[] =
                await response.json();

            setAddresses(data);

        } catch (err) {
            setAddressError(
                err instanceof Error
                    ? err.message
                    : "배송지 조회 중 오류가 발생했습니다."
            );
        } finally {
            setAddressLoading(false);
        }
    };

    /**
     * 로그인 회원 미수금 조회
     *
     * GET /api/orders/receivable
     */
    const loadReceivable = async () => {
        setReceivableLoading(true);
        setReceivableError("");

        try {
            const response = await fetch(
                "/api/orders/receivable",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "미수금 현황을 불러오지 못했습니다."
                );
            }

            const data: ReceivableInfo =
                await response.json();

            setReceivable(data);

        } catch (err) {
            setReceivableError(
                err instanceof Error
                    ? err.message
                    : "미수금 조회 중 오류가 발생했습니다."
            );
        } finally {
            setReceivableLoading(false);
        }
    };

    /**
     * 최초 화면 진입 시 회원 정보 조회
     */
    useEffect(() => {
        void loadMember();
    }, []);

    /**
     * 로그인 회원 확인 후 배송지 및 미수금 조회
     */
    useEffect(() => {
        if (!user) return;

        void loadAddresses();
        void loadReceivable();
    }, [user?.memberId]);

    /**
     * 선택한 배송지의 과거 주문 목록 조회
     *
     * GET /api/orders/history?addressId={addressId}
     */
    useEffect(() => {
        setOrderHistory([]);
        setSelectedOrderId("");
        setOrderItems([]);
        setOrderHistoryError("");
        setOrderItemsError("");

        if (!user || activeTab !== "order" || !selectedAddressId) {
            setOrderHistoryLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadOrderHistory = async () => {
            setOrderHistoryLoading(true);

            try {
                const response = await fetch(
                    `/api/orders/history?addressId=${encodeURIComponent(selectedAddressId)}`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "과거 주문 내역을 불러오지 못했습니다."
                    );
                }

                const data: OrderHistory[] =
                    await response.json();

                if (!controller.signal.aborted) {
                    setOrderHistory(data);
                }

            } catch (err) {
                if (!controller.signal.aborted) {
                    setOrderHistoryError(
                        err instanceof Error
                            ? err.message
                            : "주문 내역 조회 중 오류가 발생했습니다."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setOrderHistoryLoading(false);
                }
            }
        };

        void loadOrderHistory();

        return () => controller.abort();

    }, [user?.memberId, activeTab, selectedAddressId]);

    /**
     * 선택한 주문의 상품 상세 조회
     *
     * GET /api/orders/history/{orderId}/items
     */
    useEffect(() => {
        setOrderItems([]);
        setOrderItemsError("");

        if (!user || activeTab !== "order" || !selectedOrderId) {
            setOrderItemsLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadOrderItems = async () => {
            setOrderItemsLoading(true);

            try {
                const response = await fetch(
                    `/api/orders/history/${encodeURIComponent(selectedOrderId)}/items`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "주문 상품 정보를 불러오지 못했습니다."
                    );
                }

                const data: OrderItem[] =
                    await response.json();

                if (!controller.signal.aborted) {
                    setOrderItems(data);
                }

            } catch (err) {
                if (!controller.signal.aborted) {
                    setOrderItemsError(
                        err instanceof Error
                            ? err.message
                            : "주문 상품 조회 중 오류가 발생했습니다."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setOrderItemsLoading(false);
                }
            }
        };

        void loadOrderItems();

        return () => controller.abort();

    }, [user?.memberId, activeTab, selectedOrderId]);

    /**
     * 회원 정보 수정 시작
     */
    const handleEdit = () => {
        if (!user) return;

        setMemberName(user.memberName ?? "");
        setPhone(user.phone ?? "");
        setEmail(user.email ?? "");

        setSaveMessage("");
        setSaveError("");
        setEditing(true);
    };

    /**
     * 회원 정보 수정 취소
     */
    const handleCancel = () => {
        if (!user) return;

        setMemberName(user.memberName ?? "");
        setPhone(user.phone ?? "");
        setEmail(user.email ?? "");

        setSaveMessage("");
        setSaveError("");
        setEditing(false);
    };

    /**
     * 회원 정보 수정 저장
     *
     * 이름, 연락처, 이메일을 서버로 전달합니다.
     */
    const handleSave = async () => {
        if (!user || saving) return;

        setSaveMessage("");
        setSaveError("");

        const normalizedName = memberName.trim();
        const normalizedPhone = phone.trim();
        const normalizedEmail = email.trim();

        /* 이름 필수 입력 검증 */
        if (!normalizedName) {
            setSaveError("회원 이름을 입력해 주세요.");
            return;
        }

        if (normalizedName.length > 100) {
            setSaveError(
                "회원 이름은 100자 이내로 입력해 주세요."
            );
            return;
        }

        /* 연락처 형식 검증 */
        if (
            normalizedPhone &&
            !/^01[016789]-?\d{3,4}-?\d{4}$/.test(normalizedPhone)
        ) {
            setSaveError(
                "올바른 휴대전화 번호를 입력해 주세요."
            );
            return;
        }

        /* 이메일 형식 검증 */
        if (normalizedEmail.length > 254) {
            setSaveError(
                "이메일은 254자 이내로 입력해 주세요."
            );
            return;
        }

        if (
            normalizedEmail &&
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                normalizedEmail
            )
        ) {
            setSaveError(
                "올바른 이메일 주소를 입력해 주세요."
            );
            return;
        }

        setSaving(true);

        try {
            const response = await fetch("/api/auth/me", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    memberName: normalizedName,
                    phone: normalizedPhone || null,
                    email: normalizedEmail || null,
                }),
            });

            const data: UpdateMemberResponse =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "회원 정보 수정에 실패했습니다."
                );
            }

            /* 수정된 회원 정보 화면에 반영 */
            setUser((previous) => {
                if (!previous) return previous;

                return {
                    ...previous,
                    memberName:
                        data.memberName ?? normalizedName,
                    phone: data.phone ?? null,
                    email: data.email ?? null,
                };
            });

            setMemberName(
                data.memberName ?? normalizedName
            );
            setPhone(data.phone ?? "");
            setEmail(data.email ?? "");

            setEditing(false);
            setSaveMessage(
                data.message ||
                "회원 정보가 수정되었습니다."
            );

        } catch (err) {
            setSaveError(
                err instanceof Error
                    ? err.message
                    : "회원 정보 수정 중 오류가 발생했습니다."
            );
        } finally {
            setSaving(false);
        }
    };

    /**
     * 배송지 등록 또는 수정 시작
     */
    const startAddressEdit = (
        address?: MemberAddress
    ) => {
        setAddressError("");
        setAddressMessage("");
        setOpenAddressMenu(null);

        if (address) {
            setEditingAddressId(address.addressId);

            setAddressForm({
                addressName: address.addressName,
                recipientName: address.recipientName,
                recipientPhone: address.recipientPhone,
                zipcode: address.zipcode,
                address: address.address,
                addressDetail:
                    address.addressDetail ?? "",
                isDefault: address.isDefault,
            });

        } else {
            setEditingAddressId("new");
            setAddressForm({ ...emptyAddressForm });
        }
    };

    /**
     * 배송지 등록 및 수정 저장
     *
     * POST /api/addresses
     * PUT /api/addresses/{addressId}
     */
    const saveAddress = async () => {
        if (
            addressSaving ||
            editingAddressId === null
        ) return;

        setAddressError("");

        const requiredFields = [
            addressForm.addressName,
            addressForm.recipientName,
            addressForm.recipientPhone,
            addressForm.zipcode,
            addressForm.address,
        ];

        /* 필수 입력값 검증 */
        if (
            requiredFields.some(
                (value) => !value.trim()
            )
        ) {
            setAddressError(
                "배송지 별칭, 수령인, 연락처, 우편번호, 주소를 입력해 주세요."
            );
            return;
        }

        setAddressSaving(true);

        try {
            const isNew =
                editingAddressId === "new";

            const url = isNew
                ? "/api/addresses"
                : `/api/addresses/${editingAddressId}`;

            const response = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(addressForm),
            });

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.message ||
                    "배송지 저장에 실패했습니다."
                );
            }

            setEditingAddressId(null);

            setAddressMessage(
                isNew
                    ? "배송지를 등록했습니다."
                    : "배송지를 수정했습니다."
            );

            /* 저장 후 배송지 목록 갱신 */
            await loadAddresses();

        } catch (err) {
            setAddressError(
                err instanceof Error
                    ? err.message
                    : "배송지 저장 중 오류가 발생했습니다."
            );
        } finally {
            setAddressSaving(false);
        }
    };

    /**
     * 배송지 삭제
     *
     * DELETE /api/addresses/{addressId}
     */
    const deleteAddress = async (
        address: MemberAddress
    ) => {
        setOpenAddressMenu(null);

        /* 삭제 전 확인 */
        const confirmed = window.confirm(
            `'${address.addressName}' 배송지를 삭제하시겠습니까?`
        );

        if (!confirmed) return;

        setAddressError("");
        setAddressMessage("");

        try {
            const response = await fetch(
                `/api/addresses/${address.addressId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.message ||
                    "배송지 삭제에 실패했습니다."
                );
            }

            if (
                editingAddressId === address.addressId
            ) {
                setEditingAddressId(null);
            }

            setAddressMessage(
                "배송지를 삭제했습니다."
            );

            /* 삭제 후 배송지 목록 갱신 */
            await loadAddresses();

        } catch (err) {
            setAddressError(
                err instanceof Error
                    ? err.message
                    : "배송지 삭제 중 오류가 발생했습니다."
            );
        }
    };

    /**
     * 기본 배송지 변경
     *
     * PATCH /api/addresses/{addressId}/default
     */
    const setDefaultAddress = async (
        address: MemberAddress
    ) => {
        setOpenAddressMenu(null);
        setAddressError("");
        setAddressMessage("");

        try {
            const response = await fetch(
                `/api/addresses/${address.addressId}/default`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.message ||
                    "기본 배송지 변경에 실패했습니다."
                );
            }

            setAddressMessage(
                "기본 배송지를 변경했습니다."
            );

            /* 기본 배송지 변경 후 목록 갱신 */
            await loadAddresses();

        } catch (err) {
            setAddressError(
                err instanceof Error
                    ? err.message
                    : "기본 배송지 변경 중 오류가 발생했습니다."
            );
        }
    };

    /* 회원 정보 조회 중 */
    if (loading) {
        return (
            <main className="mypage-container">
                <div className="mypage-status">
                    회원 정보를 불러오는 중입니다...
                </div>
            </main>
        );
    }

    /* 회원 정보 조회 실패 */
    if (error) {
        return (
            <main className="mypage-container">
                <div className="mypage-status">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="mypage-retry-button"
                        onClick={() => void loadMember()}
                    >
                        다시 시도
                    </button>
                </div>
            </main>
        );
    }

    if (!user) return null;

    /* 미수금 진행 바 계산 */
    const creditLimit = 2000000;

    const receivableAmount =
        Number(receivable?.receivableAmount ?? 0);

    const availableCreditAmount =
        Number(receivable?.availableCreditAmount ?? 0);

    const creditPercent = Math.min(
        100,
        Math.max(
            0,
            (receivableAmount / creditLimit) * 100
        )
    );

    const selectedOrder = orderHistory.find(
        (order) => order.orderId === Number(selectedOrderId)
    );

    return (
        <main className="mypage-container">

            {/* 상단 탭 */}
            <nav
                className="mypage-tabs"
                aria-label="마이페이지 메뉴"
            >
                <button
                    type="button"
                    className={
                        activeTab === "member"
                            ? "mypage-tab active"
                            : "mypage-tab"
                    }
                    onClick={() =>
                        setActiveTab("member")
                    }
                >
                    회원 정보
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "order"
                            ? "mypage-tab active"
                            : "mypage-tab"
                    }
                    onClick={() =>
                        setActiveTab("order")
                    }
                >
                    주문 관리
                </button>
            </nav>

            {/* 마이페이지 제목 */}
            <div className="mypage-heading">
                <h1>마이페이지</h1>
                <p>
                    회원 정보와 쇼핑몰 이용 내역을
                    확인할 수 있습니다.
                </p>
            </div>

            {/* ===========================
                회원 정보 탭
               =========================== */}
            {activeTab === "member" && (
                <>
                    {/* 회원 프로필 */}
                    <section className="mypage-profile">
                        <div className="mypage-avatar">
                            {user.memberName?.charAt(0) || "U"}
                        </div>

                        <div className="mypage-profile-info">
                            <h2>{user.memberName}님</h2>
                            <p>
                                반갑습니다. 즐거운 쇼핑 되세요.
                            </p>
                        </div>
                    </section>

                    {/* 회원 정보 */}
                    <section className="mypage-section">
                        <div className="mypage-section-header">
                            <h2 className="mypage-section-title">
                                회원 정보
                            </h2>

                            {!editing && (
                                <button
                                    type="button"
                                    className="mypage-edit-button"
                                    onClick={handleEdit}
                                >
                                    정보 수정
                                </button>
                            )}
                        </div>

                        <div className="mypage-info-list">

                            {/* 회원번호 */}
                            <div className="mypage-info-row">
                                <span>회원번호</span>
                                <strong>{user.memberId}</strong>
                            </div>

                            {/* 이름 */}
                            <div className="mypage-info-row">
                                <span>이름</span>

                                {editing ? (
                                    <input
                                        type="text"
                                        className="mypage-input"
                                        value={memberName}
                                        onChange={(e) =>
                                            setMemberName(e.target.value)
                                        }
                                        placeholder="이름을 입력해 주세요."
                                        maxLength={100}
                                        disabled={saving}
                                    />
                                ) : (
                                    <strong>
                                        {user.memberName || "-"}
                                    </strong>
                                )}
                            </div>

                            {/* 연락처 */}
                            <div className="mypage-info-row">
                                <span>연락처</span>

                                {editing ? (
                                    <input
                                        type="tel"
                                        className="mypage-input"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="010-1234-5678"
                                        maxLength={20}
                                        disabled={saving}
                                    />
                                ) : (
                                    <strong>
                                        {user.phone || "-"}
                                    </strong>
                                )}
                            </div>

                            {/* 이메일 */}
                            <div className="mypage-info-row">
                                <span>이메일</span>

                                {editing ? (
                                    <input
                                        type="email"
                                        className="mypage-input"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="example@email.com"
                                        maxLength={254}
                                        disabled={saving}
                                    />
                                ) : (
                                    <strong>
                                        {user.email || "-"}
                                    </strong>
                                )}
                            </div>

                            {/* 소셜 로그인 연동 계정 */}
                            <div className="mypage-info-row">
                                <span>연동 계정</span>
                                <strong>
                                    {getProviderName(user.provider)}
                                </strong>
                            </div>
                        </div>

                        {/* 수정 실패 메시지 */}
                        {saveError && (
                            <p
                                className="mypage-save-error"
                                role="alert"
                            >
                                {saveError}
                            </p>
                        )}

                        {/* 수정 성공 메시지 */}
                        {saveMessage && (
                            <p
                                className="mypage-save-success"
                                role="status"
                            >
                                {saveMessage}
                            </p>
                        )}

                        {/* 수정 취소 및 저장 */}
                        {editing && (
                            <div className="mypage-edit-actions">
                                <button
                                    type="button"
                                    className="mypage-cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    취소
                                </button>

                                <button
                                    type="button"
                                    className="mypage-save-button"
                                    onClick={() =>
                                        void handleSave()
                                    }
                                    disabled={saving}
                                >
                                    {saving
                                        ? "저장 중..."
                                        : "저장"}
                                </button>
                            </div>
                        )}
                    </section>

                    {/* 배송지 관리 */}
                    <section className="mypage-section">
                        <div className="mypage-address-heading">
                            <h2 className="mypage-section-title">
                                배송지 관리
                            </h2>

                            <button
                                type="button"
                                className="mypage-edit-button"
                                onClick={() =>
                                    startAddressEdit()
                                }
                            >
                                + 배송지 추가
                            </button>
                        </div>

                        {/* 배송지 오류 메시지 */}
                        {addressError && (
                            <p
                                className="mypage-save-error"
                                role="alert"
                            >
                                {addressError}
                            </p>
                        )}

                        {/* 배송지 처리 결과 메시지 */}
                        {addressMessage && (
                            <p
                                className="mypage-save-success"
                                role="status"
                            >
                                {addressMessage}
                            </p>
                        )}

                        {addressLoading ? (
                            <p>배송지를 불러오는 중입니다...</p>
                        ) : addresses.length === 0 ? (
                            <p className="mypage-empty">
                                등록된 배송지가 없습니다.
                            </p>
                        ) : (
                            <div className="mypage-address-grid">
                                {addresses.map((address) => (
                                    <div
                                        className="mypage-address-card"
                                        key={address.addressId}
                                    >
                                        <div className="mypage-address-card-head">
                                            <div className="mypage-address-name">
                                                <strong>
                                                    {address.addressName}
                                                </strong>

                                                {address.isDefault && (
                                                    <span className="mypage-default-badge">
                                                        기본 배송지
                                                    </span>
                                                )}
                                            </div>

                                            {/* 점 3개 메뉴 */}
                                            <div className="mypage-address-menu-wrap">
                                                <button
                                                    type="button"
                                                    className="mypage-more-button"
                                                    aria-label={`${address.addressName} 관리 메뉴`}
                                                    aria-expanded={
                                                        openAddressMenu ===
                                                        address.addressId
                                                    }
                                                    onClick={() =>
                                                        setOpenAddressMenu(
                                                            openAddressMenu ===
                                                            address.addressId
                                                                ? null
                                                                : address.addressId
                                                        )
                                                    }
                                                >
                                                    ⋯
                                                </button>

                                                {openAddressMenu ===
                                                    address.addressId && (
                                                        <div className="mypage-address-menu">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    startAddressEdit(
                                                                        address
                                                                    )
                                                                }
                                                            >
                                                                수정
                                                            </button>

                                                            {!address.isDefault && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        void setDefaultAddress(
                                                                            address
                                                                        )
                                                                    }
                                                                >
                                                                    기본 배송지 설정
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="danger"
                                                                onClick={() =>
                                                                    void deleteAddress(
                                                                        address
                                                                    )
                                                                }
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <p>
                                            {address.recipientName}
                                            {" · "}
                                            {address.recipientPhone}
                                        </p>

                                        <p>
                                            ({address.zipcode}){" "}
                                            {address.address}{" "}
                                            {address.addressDetail ?? ""}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 배송지 등록 및 수정 폼 */}
                        {editingAddressId !== null && (
                            <div className="mypage-address-form">
                                <h3>
                                    {editingAddressId === "new"
                                        ? "배송지 추가"
                                        : "배송지 수정"}
                                </h3>

                                <div className="mypage-address-fields">

                                    <label>
                                        <span>배송지 별칭</span>
                                        <input
                                            className="mypage-input"
                                            value={addressForm.addressName}
                                            maxLength={100}
                                            disabled={addressSaving}
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    addressName:
                                                    e.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        <span>수령인</span>
                                        <input
                                            className="mypage-input"
                                            value={addressForm.recipientName}
                                            maxLength={100}
                                            disabled={addressSaving}
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    recipientName:
                                                    e.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        <span>연락처</span>
                                        <input
                                            className="mypage-input"
                                            value={addressForm.recipientPhone}
                                            maxLength={30}
                                            disabled={addressSaving}
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    recipientPhone:
                                                    e.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        <span>우편번호</span>
                                        <input
                                            className="mypage-input"
                                            value={addressForm.zipcode}
                                            maxLength={10}
                                            disabled={addressSaving}
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    zipcode:
                                                    e.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        <span>주소</span>
                                        <input
                                            className="mypage-input"
                                            value={addressForm.address}
                                            maxLength={255}
                                            disabled={addressSaving}
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    address:
                                                    e.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        <span>상세 주소</span>
                                        <input
                                            className="mypage-input"
                                            value={addressForm.addressDetail}
                                            maxLength={255}
                                            disabled={addressSaving}
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    addressDetail:
                                                    e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                </div>

                                {/* 신규 등록 시 기본 배송지 선택 */}
                                {editingAddressId === "new" && (
                                    <label className="mypage-default-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={
                                                addressForm.isDefault
                                            }
                                            onChange={(e) =>
                                                setAddressForm({
                                                    ...addressForm,
                                                    isDefault:
                                                    e.target.checked,
                                                })
                                            }
                                        />
                                        기본 배송지로 설정
                                    </label>
                                )}

                                <div className="mypage-edit-actions">
                                    <button
                                        type="button"
                                        className="mypage-cancel-button"
                                        disabled={addressSaving}
                                        onClick={() =>
                                            setEditingAddressId(null)
                                        }
                                    >
                                        취소
                                    </button>

                                    <button
                                        type="button"
                                        className="mypage-save-button"
                                        disabled={addressSaving}
                                        onClick={() =>
                                            void saveAddress()
                                        }
                                    >
                                        {addressSaving
                                            ? "저장 중..."
                                            : "저장"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ===========================
                주문 관리 탭
               =========================== */}
            {activeTab === "order" && (
                <>
                    {/* 미수금 현황 */}
                    <section className="mypage-section">
                        <h2 className="mypage-section-title">
                            미수금 현황
                        </h2>

                        {receivableLoading && (
                            <p>
                                미수금 현황을 불러오는 중입니다...
                            </p>
                        )}

                        {receivableError && (
                            <p
                                className="mypage-save-error"
                                role="alert"
                            >
                                {receivableError}
                            </p>
                        )}

                        {receivable && (
                            <>
                                {/* 현재 미수금 및 잔여 한도 */}
                                <div className="mypage-credit-cards">
                                    <div>
                                        <span>현재 미수금</span>
                                        <strong>
                                            {formatWon(
                                                receivableAmount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            추가 외상 가능 금액
                                        </span>
                                        <strong>
                                            {formatWon(
                                                availableCreditAmount
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                {/* 외상 한도 사용률 */}
                                <div className="mypage-credit-label">
                                    <strong>
                                        외상 한도 사용률
                                    </strong>

                                    <span>
                                        {creditPercent.toFixed(1)}%
                                    </span>
                                </div>

                                {/* 미수금 진행 바 */}
                                <div
                                    className="mypage-credit-track"
                                    role="progressbar"
                                    aria-label="외상 한도 사용률"
                                    aria-valuenow={creditPercent}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className="mypage-credit-used"
                                        style={{
                                            width: `${creditPercent}%`,
                                        }}
                                    />
                                </div>

                                {/* 진행 바 범례 */}
                                <div className="mypage-credit-legend">
                                    <span>
                                        ● 사용 중{" "}
                                        {formatWon(
                                            receivableAmount
                                        )}
                                    </span>

                                    <span>
                                        ● 잔여{" "}
                                        {formatWon(
                                            availableCreditAmount
                                        )}
                                    </span>
                                </div>

                                <p className="mypage-credit-note">
                                    총 외상 한도{" "}
                                    {formatWon(creditLimit)}
                                    {" · "}
                                    누적 외상 주문{" "}
                                    {formatWon(
                                        Number(
                                            receivable.totalCreditAmount
                                        )
                                    )}
                                    {" · "}
                                    누적 입금{" "}
                                    {formatWon(
                                        Number(
                                            receivable.totalPaidAmount
                                        )
                                    )}
                                </p>
                            </>
                        )}
                    </section>

                    {/* 간편 재주문 */}
                    <section className="mypage-section">
                        <h2 className="mypage-section-title">
                            간편 재주문
                        </h2>

                        <div className="mypage-reorder">

                            {/* 배송지 선택 */}
                            <label>
                                배송지 선택

                                <select
                                    className="mypage-input"
                                    value={selectedAddressId}
                                    onChange={(e) =>
                                        setSelectedAddressId(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        배송지를 선택해 주세요.
                                    </option>

                                    {addresses.map((address) => (
                                        <option
                                            key={address.addressId}
                                            value={address.addressId}
                                        >
                                            {address.addressName}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* 과거 주문 선택 */}
                            <label>
                                이전 주문 선택

                                <select
                                    className="mypage-input"
                                    value={selectedOrderId}
                                    disabled={
                                        !selectedAddressId ||
                                        orderHistoryLoading ||
                                        orderHistory.length === 0
                                    }
                                    onChange={(e) =>
                                        setSelectedOrderId(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        {orderHistoryLoading
                                            ? "주문 내역 조회 중..."
                                            : !selectedAddressId
                                                ? "배송지를 먼저 선택해 주세요."
                                                : orderHistory.length === 0
                                                    ? "조회 가능한 주문이 없습니다."
                                                    : "이전 주문을 선택해 주세요."}
                                    </option>

                                    {orderHistory.map((order) => (
                                        <option
                                            key={order.orderId}
                                            value={order.orderId}
                                        >
                                            {order.orderNo}
                                            {" · "}
                                            {formatWon(order.totalAmount)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* 과거 주문 조회 오류 */}
                            {orderHistoryError && (
                                <p
                                    className="mypage-save-error"
                                    role="alert"
                                >
                                    {orderHistoryError}
                                </p>
                            )}

                            {/* 선택한 주문의 상품 상세 */}
                            {selectedOrderId && (
                                <div className="mypage-order-detail">

                                    <h3>주문 상품 상세</h3>

                                    {selectedOrder && (
                                        <div className="mypage-order-summary">
                                            <p>
                                                <strong>주문번호</strong>
                                                {" "}
                                                {selectedOrder.orderNo}
                                            </p>

                                            <p>
                                                <strong>주문일시</strong>
                                                {" "}
                                                {formatOrderDate(
                                                    selectedOrder.createdAt
                                                )}
                                            </p>

                                            <p>
                                                <strong>배송지</strong>
                                                {" "}
                                                {selectedOrder.addressName}
                                            </p>

                                            <p>
                                                <strong>주문상태</strong>
                                                {" "}
                                                {selectedOrder.orderStatus}
                                            </p>

                                            <p>
                                                <strong>결제상태</strong>
                                                {" "}
                                                {selectedOrder.paymentStatus}
                                            </p>
                                        </div>
                                    )}

                                    {orderItemsLoading ? (
                                        <p>
                                            주문 상품을 불러오는 중입니다...
                                        </p>
                                    ) : orderItemsError ? (
                                        <p
                                            className="mypage-save-error"
                                            role="alert"
                                        >
                                            {orderItemsError}
                                        </p>
                                    ) : orderItems.length === 0 ? (
                                        <p className="mypage-empty">
                                            주문 상품이 없습니다.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="mypage-order-table-wrap">
                                                <table className="mypage-order-table">
                                                    <thead>
                                                    <tr>
                                                        <th>상품명</th>
                                                        <th>단가</th>
                                                        <th>수량</th>
                                                        <th>합계</th>
                                                    </tr>
                                                    </thead>

                                                    <tbody>
                                                    {orderItems.map((item) => (
                                                        <tr key={item.orderItemId}>
                                                            <td>
                                                                {item.productName}
                                                            </td>

                                                            <td>
                                                                {formatWon(
                                                                    item.unitPrice
                                                                )}
                                                            </td>

                                                            <td>
                                                                {Number(
                                                                    item.quantity
                                                                )}
                                                            </td>

                                                            <td>
                                                                {formatWon(
                                                                    item.totalAmount
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="mypage-order-total">
                                                <span>주문 총금액</span>

                                                <strong>
                                                    {formatWon(
                                                        Number(
                                                            selectedOrder?.totalAmount ?? 0
                                                        )
                                                    )}
                                                </strong>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 재주문 버튼 - 주문 생성 API 연결 전 비활성화 */}
                            <div className="mypage-reorder-actions">
                                <button
                                    type="button"
                                    disabled
                                >
                                    장바구니 담기
                                </button>

                                <button
                                    type="button"
                                    disabled
                                >
                                    바로 주문
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 쇼핑몰 이용 메뉴 */}
                    <section className="mypage-section">
                        <h2 className="mypage-section-title">
                            쇼핑몰 이용
                        </h2>

                        <div className="mypage-menu-grid">

                            {/* 주문 내역 */}
                            <div className="mypage-menu-card">
                                <div className="mypage-menu-icon">
                                    📦
                                </div>
                                <strong>주문 내역</strong>
                                <p>
                                    주문 및 배송 현황을 확인합니다.
                                </p>
                                <span className="mypage-coming-soon">
                                    준비 중
                                </span>
                            </div>

                            {/* 미수금 및 입금 내역 */}
                            <div className="mypage-menu-card">
                                <div className="mypage-menu-icon">
                                    💳
                                </div>
                                <strong>미수금 / 입금 내역</strong>
                                <p>
                                    미결제 금액과 입금 내역을 확인합니다.
                                </p>
                                <span className="mypage-coming-soon">
                                    준비 중
                                </span>
                            </div>

                            {/* 회원 정보 관리 */}
                            <div className="mypage-menu-card">
                                <div className="mypage-menu-icon">
                                    👤
                                </div>
                                <strong>회원 정보 관리</strong>
                                <p>
                                    회원 정보를 수정할 수 있습니다.
                                </p>
                                <button
                                    type="button"
                                    className="mypage-menu-link"
                                    onClick={() =>
                                        setActiveTab("member")
                                    }
                                >
                                    회원 정보 보기
                                </button>
                            </div>

                            {/* 배송지 관리 */}
                            <div className="mypage-menu-card">
                                <div className="mypage-menu-icon">
                                    🚚
                                </div>
                                <strong>배송지 관리</strong>
                                <p>
                                    등록된 배송지를 관리합니다.
                                </p>
                                <button
                                    type="button"
                                    className="mypage-menu-link"
                                    onClick={() =>
                                        setActiveTab("member")
                                    }
                                >
                                    배송지 관리하기
                                </button>
                            </div>

                        </div>
                    </section>
                </>
            )}

        </main>
    );
}
