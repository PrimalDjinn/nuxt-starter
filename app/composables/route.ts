export function useRouteQuery(key: string, array: true): WritableComputedRef<string[]>;
export function useRouteQuery(key: string): WritableComputedRef<string | undefined>;
export function useRouteQuery(key: string, array = false) {
  const route = useRoute();
  return computed({
    get() {
      const value = route.query[key];
      if (!array) {
        if (Array.isArray(value)) {
          return value.at(-1)?.toString();
        }

        return value?.toString();
      } else {
        return Array.isArray(value) ? value.map((v) => v?.toString()) : [value?.toString()];
      }
    },
    set(value) {
      const router = useRouter();

      if (value === undefined || value === null) {
        router.push({
          query: {
            ...route.query,
            [key]: undefined,
          },
        });
        return;
      }

      if (Array.isArray(value)) {
        if (value.length) {
          value.forEach((v) => {
            router.push({
              query: {
                ...route.query,
                [key]: v,
              },
            });
          });
          return;
        }

        router.push({
          query: {
            ...route.query,
            [key]: undefined,
          },
        });
        return;
      }

      router.push({
        query: {
          ...route.query,
          [key]: value,
        },
      });
    },
  });
}

export function useRouteParam(key: string, array: true): ComputedRef<string[]>;
export function useRouteParam(key: string): ComputedRef<string | undefined>;
export function useRouteParam(key: string, array?: true) {
  const route = useRoute();
  return computed(() => {
    const value = route.params[key];
    if (!array) {
      if (Array.isArray(value)) {
        return value.at(-1);
      }

      return value;
    } else {
      return Array.isArray(value) ? value : [value];
    }
  });
}
