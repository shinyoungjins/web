import { useState } from "react";
import "../styles/OrderComplete.css";

/* 주문 완료 페이지에 전달되는 주문 상품 */
interface CompletedItem {
    productId: number;
    productName: string;
    pricePerKg: number | null;
    weightGram: number;
    quantity: number;
}

/* 주문 당시 선택한 배송지 */
interface CompletedAddress {
    addressName: string;
    recipientName: string;
    recipientPhone: string;
    zipcode: string;
    address: string;
    addressDetail: string | null;
}

/* 주문 생성 API 성공 후 저장한 결과 */
interface CompletedOrder {
    orderId?: number;
    orderNo?: string;
    totalAmount: number;
    items: CompletedItem[];
    address: CompletedAddress | null;
    paymentType: string;
}

const formatWon = (amount: number) => `${Number(amount).toLocaleString("ko-KR")}원`;

/** 주문 완료: 이 화면에서는 주문 API를 다시 호출하지 않습니다. */
export default function OrderComplete() {
    const [order] = useState<CompletedOrder | null>(() => {
        try {
            const raw = sessionStorage.getItem("completedOrder");
            if (!raw) return null;
            const parsed = JSON.parse(raw) as CompletedOrder;
            if (!parsed || !Array.isArray(parsed.items) || !Number.isFinite(Number(parsed.totalAmount))) return null;
            return parsed;
        } catch {
            return null;
        }
    });

    if (!order) {
        return (
            <div className="order-complete-page">
                <section className="order-complete-panel order-complete-empty">
                    <h1>주문 완료 정보가 없습니다.</h1>
                    <p>주문 내역은 마이페이지에서 확인하실 수 있습니다.</p>
                    <a className="order-complete-primary" href="/mypage?tab=order">
                        마이페이지로 이동
                    </a>
                </section>
            </div>
        );
    }

    return (
        <div className="order-complete-page">
            <header className="order-complete-heading">
                <div className="order-complete-check" aria-hidden="true">✓</div>
                <h1>주문이 완료되었습니다.</h1>
                <p>주문이 정상 접수되었습니다. 주문 내역은 마이페이지에서 확인하실 수 있습니다.</p>
            </header>

            <section className="order-complete-panel">
                <h2>주문 정보</h2>
                <div className="order-complete-row"><span>주문번호</span><strong>{order.orderNo ?? order.orderId ?? "주문 접수 완료"}</strong></div>
                <div className="order-complete-row"><span>주문상태</span><strong>주문 접수</strong></div>
                <div className="order-complete-row"><span>결제 방식</span><strong>{order.paymentType === "CREDIT" ? "외상 결제" : order.paymentType}</strong></div>
            </section>

            <section className="order-complete-panel">
                <h2>주문 상품</h2>
                <div className="order-complete-table-wrap">
                    <table>
                        <thead><tr><th>상품명</th><th>중량</th><th>수량</th><th>예상 상품금액</th></tr></thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={`${item.productId}-${index}`}>
                                    <td>{item.productName}</td>
                                    <td>{item.weightGram / 1000}kg</td>
                                    <td>{item.quantity}개</td>
                                    <td>{item.pricePerKg == null ? "-" : formatWon(item.pricePerKg * item.weightGram / 1000 * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="order-complete-note">상품별 금액은 주문서에 표시된 예상 금액입니다. 확정 총액은 서버의 주문 결과를 기준으로 합니다.</p>
                <div className="order-complete-total"><span>최종 주문금액</span><strong>{formatWon(order.totalAmount)}</strong></div>
            </section>

            <section className="order-complete-panel">
                <h2>배송 정보</h2>
                {order.address ? (
                    <>
                        <div className="order-complete-row"><span>배송지</span><strong>{order.address.addressName}</strong></div>
                        <div className="order-complete-row"><span>받는 분</span><strong>{order.address.recipientName}</strong></div>
                        <div className="order-complete-row"><span>연락처</span><strong>{order.address.recipientPhone}</strong></div>
                        <div className="order-complete-row"><span>주소</span><strong>({order.address.zipcode}) {order.address.address} {order.address.addressDetail ?? ""}</strong></div>
                    </>
                ) : <p>배송지 정보는 마이페이지의 주문 내역에서 확인해 주세요.</p>}
            </section>

            <div className="order-complete-actions">
                <a className="order-complete-secondary" href="/">
                    쇼핑 계속하기
                </a>
                <a className="order-complete-primary" href="/mypage?tab=order">
                    주문 내역 보기
                </a>
            </div>
        </div>
    );
}
