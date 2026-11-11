
export interface SiteMenu {
    menuId: number;
    menuName: string;
    menuUrl: string;
    parentMenuId: number | null;
    sortOrder: number;
    useYn: string;
    createdAt: string;
    updatedAt: string;
}

export async function getMenuList(): Promise<SiteMenu[]> {
    const response = await fetch("/api/menus");

    if (!response.ok) {
        throw new Error("메뉴 목록 조회에 실패했습니다.");
    }

    return response.json();
}
