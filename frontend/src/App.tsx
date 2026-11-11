
import Header from "./components/Header";
import Slideshow from "./components/Slideshow";
import Footer from "./components/Footer";
import ScrollButtons from "./components/ScrollButtons";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

import "./App.css";

function App() {
    const pathname = window.location.pathname;

    // 상품 목록 페이지
    const isProductListPage =
        pathname === "/products" ||
        pathname === "/products/";

    // 상품 상세 페이지 (/products/9)
    const isProductDetailPage =
        /^\/products\/\d+\/?$/.test(pathname);

    // 장바구니 페이지
    const isCartPage =
        pathname === "/cart" ||
        pathname === "/cart/";

    // 페이지별 콘텐츠
    const renderContent = () => {
        // 장바구니 페이지
        if (isCartPage) {
            return <Cart />;
        }

        // 상품 상세 페이지
        if (isProductDetailPage) {
            return <ProductDetail />;
        }

        // 상품 목록 페이지
        if (isProductListPage) {
            return <ProductList />;
        }

        // 홈 화면
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
