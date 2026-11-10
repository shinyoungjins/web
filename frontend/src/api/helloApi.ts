
export async function getHelloMessage(): Promise<string> {
    const response = await fetch('/api/hello');

    if (!response.ok) {
        throw new Error('Spring Boot API 호출 실패');
    }

    return response.text();
}
