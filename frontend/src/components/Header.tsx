
import { useEffect, useState } from "react";
import type { SiteMenu } from "../api/menuApi";
import { getMenuList } from "../api/menuApi";
import mainMark from "../assets/mainMark.png";
import "../styles/Header.css";

/**
 * 로그인 회원 정보
 */
interface AuthUser {
    authenticated: boolean;
    memberId?: number;
    memberName?: string;
    email?: string | null;
    role?: string;
    provider?: string;
}

export default function Header() {
    const [menus, setMenus] = useState<SiteMenu[]>([]);

    // 로그인 회원 정보
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

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

    useEffect(() => {
        /**
         * 현재 로그인한 회원 정보 조회
         */
        const loadUser = async () => {
            try {
                const response = await fetch("/api/auth/me", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("로그인 정보 조회 실패");
                }

                const data: AuthUser = await response.json();
                console.log("헤더 로그인 정보:", data);

                if (data.authenticated) {
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("로그인 정보 조회 실패:", error);
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        loadUser();
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
                {!authLoading && (
                    user ? (
                        <>
                            <span className="header-user-name">
                                {user.memberName || "회원"}님
                            </span>
                            <a href="/mypage">마이페이지</a>
                            <a href="http://localhost:8080/logout">로그아웃</a>
                        </>
                    ) : (
                        <a href="/login">로그인</a>
                    )
                )}

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
