
import Header from "./components/Header";
import Slideshow from "./components/Slideshow";
import Footer from "./components/Footer";
import ScrollButtons from "./components/ScrollButtons";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import About from "./pages/About";
import NoticePage from "./pages/Notice";
import NoticeDetail from "./pages/NoticeDetail";

import "./App.css";

function App() {
    const pathname = window.location.pathname;

    /* 상품 목록 페이지 */
    const isProductListPage =
        pathname === "/products" || pathname === "/products/";

    /* 상품 상세 페이지 */
    const isProductDetailPage =
        /^\/products\/\d+\/?$/.test(pathname);

    /* 장바구니 페이지 */
    const isCartPage =
        pathname === "/cart" || pathname === "/cart/";

    /* 회사소개 페이지 */
    const isAboutPage =
        pathname === "/about" || pathname === "/about/";

    /* 공지사항 목록 페이지 */
    const isNoticePage =
        pathname === "/notice" || pathname === "/notice/";

    /* 공지사항 상세 페이지 */
    const isNoticeDetailPage =
        /^\/notice\/\d+\/?$/.test(pathname);

    /**
     * 현재 URL에 따른 페이지 렌더링
     */
    const renderContent = () => {
        if (isCartPage) {
            return <Cart />;
        }

        if (isProductDetailPage) {
            return <ProductDetail />;
        }

        if (isProductListPage) {
            return <ProductList />;
        }

        if (isAboutPage) {
            return <About />;
        }

        if (isNoticeDetailPage) {
            return <NoticeDetail />;
        }

        if (isNoticePage) {
            return <NoticePage />;
        }

        /* 기본 홈 화면 */
        return (
            <>
                <Slideshow />
                <Home />
            </>
        );
    };

    return (
        <>
            <Header />

            <main>
                {renderContent()}
            </main>

            <Footer />
            <ScrollButtons />
        </>
    );
}

export default App;
