import consola from "consola"

// At some point this will fail with nuxt instance not found.
// There are known issues with composables.
export const useAsyncState = async <T>(key: string, fn: () => Promise<T>, options?: {
    errors: Ref<Array<any>>
}) => {
    const { data: initial } = useNuxtData(key)
    if (initial.value) return Promise.resolve(initial as Ref<T>)
    const { data: _new, error } = await useAsyncData<T>(key, fn)
    if (error && options?.errors) {
        consola.error("An error occurred while fetching data for", key)
        consola.error(error)
        options.errors.value.push(error)
    }
    return _new as Ref<T>
}