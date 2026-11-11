
import { useEffect, useState } from "react";
import type { SiteMenu } from "../api/menuApi";
import { getMenuList } from "../api/menuApi";
import mainMark from "../assets/mainMark.png";
import "../styles/Header.css";

export default function Header() {
    const [menus, setMenus] = useState<SiteMenu[]>([]);

    useEffect(() => {
        const loadMenus = async () => {
            try {
                const data = await getMenuList();
                setMenus(data);
            } catch (error) {
                console.error("메뉴 조회 실패:", error);
            }
        };

        loadMenus();
    }, []);

    // 상위 메뉴
    const parentMenus = menus
        .filter((menu) => menu.parentMenuId === null)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    // 하위 메뉴
    const getChildMenus = (parentId: number) => {
        return menus
            .filter((menu) => menu.parentMenuId === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    };

    return (
        <header className="site-header">
            <div className="header-user-menu">
                <a href="/login">로그인</a>
                <a href="/signup">회원가입</a>
                <a href="/cart">장바구니</a>
            </div>

            <div className="header-logo">
                <a href="/">
                    <img src={mainMark} alt="DG 로고" />
                </a>
            </div>

            <nav className="header-nav">
                <ul className="header-menu-list">
                    {parentMenus.map((menu) => {
                        const childMenus = getChildMenus(menu.menuId);

                        return (
                            <li className="header-menu-item" key={menu.menuId}>
                                <a href={menu.menuUrl}>{menu.menuName}</a>

                                {childMenus.length > 0 && (
                                    <ul className="header-submenu">
                                        {childMenus.map((child) => (
                                            <li key={child.menuId}>
                                                <a href={child.menuUrl}>
                                                    {child.menuName}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}
