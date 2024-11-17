export function useRedirect(target: string, base?: string): string;
export function useRedirect(): string | null;
export function useRedirect(target?: string, base?: string) {
    const route = useRoute()
    if (!target) {
        let redirect = route.query?.redirect
        if (!redirect) return null
        if (Array.isArray(redirect)) {
            redirect = redirect.filter(Boolean)
            return redirect.at(-1) as string
        } else {
            return redirect
        }
    }

    if (!base) base = route.path

    if (base.endsWith("/")) base = base.slice(0, -1)
    if(!target.startsWith("/")) target = `/${target}`

    return base + target
}