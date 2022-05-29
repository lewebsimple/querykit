import { ref } from "vue-demi";
import param from "jquery-param";

export function useQueryFetch<Return>({
  url,
  method = "POST",
  contentType = "application/x-www-form-urlencoded",
}: {
  url: string;
  method: "GET" | "POST";
  contentType: "application/x-www-form-urlencoded" | "application/json";
}) {
  const isQuerying = ref<boolean>(false);
  async function query<Result>(params: any): Promise<{ error?: string; result?: Result }> {
    let error: undefined | string, result: undefined | Result;
    try {
      isQuerying.value = true;
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": contentType,
        },
        body: contentType === "application/json" ? JSON.stringify(params) : param(params),
      });
      result = (await response.json()) as unknown as Result;
    } catch (e) {
      error = typeof e === "string" ? e : e instanceof Error ? e.message : undefined;
    } finally {
      isQuerying.value = false;
    }
    return { error, result };
  }
  return { isQuerying, query };
}
