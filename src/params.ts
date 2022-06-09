import { computed, reactive, watch } from "vue-demi";
import { parse, stringify } from "query-string";

export type BaseParams = Record<string, boolean | number | string | string[]>;

export function useQueryParams<ParamsType extends BaseParams>({
  defaults,
  exclude,
  onChange,
  onReset,
}: {
  defaults: ParamsType;
  exclude?: (keyof ParamsType)[];
  onChange?: (newParams: ParamsType, oldParams: ParamsType) => any | Promise<any>;
  onReset?: () => any | Promise<any>;
}) {
  // Handle URL search params
  const defaultParams = computed(() => {
    const urlSearchParams = parse(window.location.search || "", { arrayFormat: "comma", sort: false });
    const filtered = Object.keys(defaults).reduce((prev, key) => {
      let value = urlSearchParams[key] || defaults[key];
      if (typeof value !== typeof defaults[key]) {
        switch (typeof defaults[key]) {
          case "boolean":
            value = !!value;
            break;
          case "number":
            value = parseInt(value as string);
            break;
        }
      }
      return { ...prev, [key]: value };
    }, {});
    return Object.assign({}, filtered);
  });

  // Initialize reactive params with cloned defaults
  const params = reactive<ParamsType>({ ...(defaultParams.value as ParamsType) });

  // Handle reset logic
  const canReset = computed<boolean>(() => JSON.stringify(params) !== JSON.stringify(defaults));
  async function reset() {
    Object.assign(params, { ...defaults });
    onReset && (await onReset());
  }

  // Update window.location.search from filtered params
  watch(
    () => ({ ...params }),
    async (newParams, oldParams) => {
      const urlSearchParams = parse(window.location.search || "", { arrayFormat: "comma", sort: false });
      const search = stringify(
        Object.keys(newParams).reduce((prev, key) => {
          if ((exclude && exclude.includes(key)) || defaults[key] === newParams[key]) {
            delete prev[key];
            return prev;
          }
          return { ...prev, [key]: newParams[key] };
        }, urlSearchParams as ParamsType),
      );
      window.history.replaceState(null, "", `?${search}`);
      onChange && (await onChange(newParams as ParamsType, oldParams as ParamsType));
    },
  );

  return { params, canReset, reset };
}
