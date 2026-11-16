import { useEffect, useState } from "react";
import "../styles/OrderCheckout.css";

interface CheckoutItem { productId: number; productName: string; pricePerKg: number | null; weightGram: number; quantity: number; }
interface CheckoutDraft { addressId: number | null; items: CheckoutItem[]; }
interface Address { addressId: number; addressName: string; recipientName: string; recipientPhone: string; zipcode: string; address: string; addressDetail: string | null; isDefault: boolean; }
interface Member { authenticated: boolean; memberName: string; phone: string | null; email: string | null; }
interface NewAddress { addressName: string; recipientName: string; recipientPhone: string; zipcode: string; address: string; addressDetail: string; isDefault: boolean; }
interface OrderResult { orderId?: number; orderNo?: string; totalAmount?: number; message?: string; }

declare global {
    interface Window {
        daum?: { Postcode: new (options: { oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string; userSelectedType: string }) => void }) => { open: () => void } };
    }
}

const won = (value: number) => `${Number(value).toLocaleString("ko-KR")}원`;
const blankAddress = (): NewAddress => ({ addressName: "", recipientName: "", recipientPhone: "", zipcode: "", address: "", addressDetail: "", isDefault: false });

/** 다음 우편번호 검색 스크립트는 주소 검색을 누를 때만 로드합니다. */
function loadPostcode(): Promise<void> {
    if (window.daum?.Postcode) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-daum-postcode="true"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("주소 검색 서비스를 불러오지 못했습니다.")), { once: true });
            return;
        }
        const script = document.createElement("script");
        script.dataset.daumPostcode = "true";
        script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("주소 검색 서비스를 불러오지 못했습니다."));
        document.head.appendChild(script);
    });
}

export default function OrderCheckout() {
    const [draft] = useState<CheckoutDraft | null>(() => {
        try {
            const raw = sessionStorage.getItem("checkoutDraft");
            if (!raw) return null;
            const parsed: CheckoutDraft = JSON.parse(raw);
            return Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed : null;
        } catch { return null; }
    });
    const [member, setMember] = useState<Member | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [addressMode, setAddressMode] = useState<"default" | "other">("default");
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [otherAddress, setOtherAddress] = useState("new");
    const [newAddress, setNewAddress] = useState<NewAddress>(blankAddress);
    const [deliveryMessage, setDeliveryMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const [memberResponse, addressResponse] = await Promise.all([
                    fetch("/api/auth/me", { credentials: "include" }),
                    fetch("/api/addresses", { credentials: "include" }),
                ]);
                if (!memberResponse.ok || !addressResponse.ok) throw new Error("회원 또는 배송지 정보를 조회하지 못했습니다.");
                const currentMember: Member = await memberResponse.json();
                if (!currentMember.authenticated) { window.location.href = "/login"; return; }
                const list: Address[] = await addressResponse.json();
                if (!active) return;
                setMember(currentMember);
                setAddresses(list);
                const defaultAddress = list.find((item) => item.isDefault) ?? list[0];
                if (defaultAddress) setSelectedAddressId(String(defaultAddress.addressId));
                const draftAddress = list.find((item) => item.addressId === draft?.addressId);
                if (draftAddress && defaultAddress && draftAddress.addressId !== defaultAddress.addressId) {
                    setAddressMode("other");
                    setOtherAddress(String(draftAddress.addressId));
                }
            } catch (err) {
                if (active) setLoadError(err instanceof Error ? err.message : "정보 조회에 실패했습니다.");
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, [draft?.addressId]);

    const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0];
    const chosenAddress = addressMode === "default"
        ? defaultAddress
        : otherAddress === "new" ? null : addresses.find((item) => String(item.addressId) === otherAddress);
    const total = (draft?.items ?? []).reduce((sum, item) => sum + (Number(item.pricePerKg ?? 0) * item.weightGram / 1000) * item.quantity, 0);

    const searchAddress = async () => {
        try {
            await loadPostcode();
            if (!window.daum?.Postcode) throw new Error("주소 검색 서비스를 사용할 수 없습니다.");
            new window.daum.Postcode({
                oncomplete: (data) => {
                    setNewAddress((prev) => ({ ...prev, zipcode: data.zonecode, address: data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress }));
                },
            }).open();
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "주소 검색에 실패했습니다.");
        }
    };

    /** 실제 주문은 이 함수에서만 생성합니다. 새 주소는 먼저 회원 배송지로 등록합니다. */
    const submitOrder = async () => {
        if (submitting || !draft || !member) return;
        setSubmitError("");
        if (!member.memberName?.trim() || !member.phone?.trim()) { setSubmitError("마이페이지 회원 정보에서 이름과 연락처를 먼저 등록해 주세요."); return; }
        if (draft.items.some((item) => !Number.isInteger(item.productId) || ![1000, 5000, 10000].includes(item.weightGram) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.pricePerKg == null)) {
            setSubmitError("주문 상품의 중량, 수량 또는 가격이 올바르지 않습니다."); return;
        }
        const isNew = addressMode === "other" && otherAddress === "new";
        if (!isNew && !chosenAddress) { setSubmitError("배송지를 선택해 주세요."); return; }
        if (isNew && [newAddress.addressName, newAddress.recipientName, newAddress.recipientPhone, newAddress.zipcode, newAddress.address].some((field) => !field.trim())) {
            setSubmitError("새 배송지의 별칭, 수령인, 연락처, 우편번호, 주소를 입력해 주세요."); return;
        }
        if (!window.confirm(`예상 주문금액: ${won(total)}\n결제 방식: 외상 결제\n\n주문을 확정하시겠습니까?`)) return;
        setSubmitting(true);
        try {
            let addressId = chosenAddress?.addressId;
            if (isNew) {
                const addressResponse = await fetch("/api/addresses", {
                    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAddress),
                });
                if (!addressResponse.ok) {
                    const result = await addressResponse.json().catch(() => ({}));
                    throw new Error(result.message || "새 배송지를 등록하지 못했습니다.");
                }
                // 등록 API 응답 형태와 무관하게 목록을 다시 조회해 등록된 배송지를 찾습니다.
                const listResponse = await fetch("/api/addresses", { credentials: "include" });
                if (!listResponse.ok) throw new Error("배송지는 등록되었지만 목록을 다시 조회하지 못했습니다. 주문을 재시도하기 전에 배송지를 확인해 주세요.");
                const list: Address[] = await listResponse.json();
                setAddresses(list);
                const matches = list.filter((item) => item.addressName === newAddress.addressName && item.recipientName === newAddress.recipientName && item.recipientPhone === newAddress.recipientPhone && item.zipcode === newAddress.zipcode && item.address === newAddress.address && (item.addressDetail ?? "") === newAddress.addressDetail);
                if (matches.length !== 1) throw new Error("배송지는 등록되었지만 주문할 주소를 확정하지 못했습니다. 등록된 배송지에서 다시 선택해 주세요.");
                addressId = matches[0].addressId;
                setOtherAddress(String(addressId));
            }
            if (addressId == null) throw new Error("배송지를 선택해 주세요.");
            const response = await fetch("/api/orders", {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    addressId,
                    ordererName: member.memberName.trim(),
                    ordererPhone: member.phone.trim(),
                    ordererEmail: member.email?.trim() || null,
                    deliveryMessage: deliveryMessage.trim(),
                    items: draft.items.map((item) => ({ productId: item.productId, weightGram: item.weightGram, quantity: item.quantity })),
                }),
            });
            const result: OrderResult = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || `주문 처리에 실패했습니다. (HTTP ${response.status})`);
            // 주문 성공 정보만 완료 화면으로 전달합니다. (주문 생성 API 재호출 없음)
            sessionStorage.setItem("completedOrder", JSON.stringify({
                orderId: result.orderId,
                orderNo: result.orderNo,
                totalAmount: result.totalAmount ?? total,
                items: draft.items,
                address: isNew ? {
                    addressName: newAddress.addressName,
                    recipientName: newAddress.recipientName,
                    recipientPhone: newAddress.recipientPhone,
                    zipcode: newAddress.zipcode,
                    address: newAddress.address,
                    addressDetail: newAddress.addressDetail,
                } : chosenAddress,
                paymentType: "CREDIT",
            }));
            sessionStorage.removeItem("checkoutDraft");
            window.location.href = "/order/complete";
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "주문 처리 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!draft) return <div className="checkout-page"><h1>주문서 작성</h1><p>주문할 상품 정보가 없습니다. 마이페이지에서 상품을 선택해 주세요.</p><a href="/mypage">마이페이지로 돌아가기</a></div>;

    return <div className="checkout-page">
        <h1>주문서 작성</h1>
        {loading && <p>회원 및 배송지 정보를 불러오는 중입니다...</p>}
        {loadError && <p className="checkout-error" role="alert">{loadError}</p>}
        <section className="checkout-panel"><h2>주문 상품</h2>
            <div className="checkout-table-wrap"><table><thead><tr><th>상품명</th><th>중량</th><th>수량</th><th>상품금액</th></tr></thead><tbody>
                {draft.items.map((item, index) => <tr key={`${item.productId}-${index}`}><td>{item.productName}</td><td>{item.weightGram / 1000}kg</td><td>{item.quantity}개</td><td>{won(Number(item.pricePerKg ?? 0) * item.weightGram / 1000 * item.quantity)}</td></tr>)}
            </tbody></table></div>
        </section>
        <section className="checkout-panel"><h2>배송 정보</h2>
            <div className="checkout-radio-row"><label><input type="radio" name="addressMode" checked={addressMode === "default"} onChange={() => setAddressMode("default")} /> 기본 배송지</label><label><input type="radio" name="addressMode" checked={addressMode === "other"} onChange={() => setAddressMode("other")} /> 다른 배송지</label></div>
            {addressMode === "other" && <div className="checkout-field"><label htmlFor="checkout-address-select">등록된 배송지 / 새 주소</label><select id="checkout-address-select" value={otherAddress} onChange={(event) => setOtherAddress(event.target.value)}>
                {addresses.map((address) => <option key={address.addressId} value={address.addressId}>{address.addressName} · {address.address} {address.addressDetail ?? ""}</option>)}
                <option value="new">+ 새 주소 검색 및 등록</option>
            </select></div>}
            {addressMode === "other" && otherAddress === "new" ? <div className="checkout-new-address">
                <div className="checkout-field"><label>배송지 별칭</label><input value={newAddress.addressName} onChange={(e) => setNewAddress((p) => ({ ...p, addressName: e.target.value }))} placeholder="예: 회사" /></div>
                <div className="checkout-field"><label>수령인</label><input value={newAddress.recipientName} onChange={(e) => setNewAddress((p) => ({ ...p, recipientName: e.target.value }))} /></div>
                <div className="checkout-field"><label>연락처</label><input type="tel" value={newAddress.recipientPhone} onChange={(e) => setNewAddress((p) => ({ ...p, recipientPhone: e.target.value }))} /></div>
                <div className="checkout-field"><label>우편번호</label><div className="checkout-postcode"><input value={newAddress.zipcode} readOnly placeholder="주소 검색으로 입력" /><button type="button" onClick={() => void searchAddress()}>주소 검색</button></div></div>
                <div className="checkout-field"><label>주소</label><input value={newAddress.address} readOnly placeholder="주소 검색으로 입력" /></div>
                <div className="checkout-field"><label>상세 주소</label><input value={newAddress.addressDetail} onChange={(e) => setNewAddress((p) => ({ ...p, addressDetail: e.target.value }))} /></div>
            </div> : chosenAddress ? <div className="checkout-address-summary"><strong>{chosenAddress.addressName}</strong><p>{chosenAddress.recipientName} · {chosenAddress.recipientPhone}</p><p>({chosenAddress.zipcode}) {chosenAddress.address} {chosenAddress.addressDetail ?? ""}</p></div> : <p>등록된 배송지가 없습니다. 다른 배송지에서 새 주소를 등록해 주세요.</p>}
            <div className="checkout-field"><label htmlFor="checkout-delivery-message">배송 요청사항</label><textarea id="checkout-delivery-message" rows={3} value={deliveryMessage} onChange={(e) => setDeliveryMessage(e.target.value)} placeholder="배송 요청사항을 입력해 주세요." /></div>
        </section>
        <section className="checkout-panel"><h2>결제 방식</h2><div className="checkout-payment"><label><input type="radio" name="payment" checked readOnly /> 외상 결제</label><label className="checkout-disabled"><input type="radio" name="payment" disabled /> 카드 결제 (준비 중)</label><label className="checkout-disabled"><input type="radio" name="payment" disabled /> 간편 결제 (준비 중)</label></div></section>
        <section className="checkout-panel"><div className="checkout-total"><strong>예상 주문 금액</strong><strong>{won(total)}</strong></div><p className="checkout-note">실제 주문금액은 서버에서 최신 단가로 다시 계산합니다. 주문 확정 시 재고가 차감됩니다.</p>
            {submitError && <p className="checkout-error" role="alert">{submitError}</p>}
            <div className="checkout-actions"><button type="button" className="checkout-back" onClick={() => window.history.back()} disabled={submitting}>이전으로</button><button type="button" className="checkout-submit" onClick={() => void submitOrder()} disabled={loading || !!loadError || submitting || !member}>{submitting ? "주문 처리 중..." : "주문 확정하기"}</button></div>
        </section>
    </div>;
}
