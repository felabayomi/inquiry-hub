export async function fetchSession<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  const timeout = AbortSignal.timeout(15000);
  const res = await fetch(url, {
    credentials: "include",
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (res.status === 401 && !res.headers.get("content-type")?.includes("text/html")) return null;
  if (!res.ok) throw new Error("Unable to connect to Inquiry Hub. Please try again shortly.");
  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Inquiry Hub returned an unexpected response. Please try again shortly.");
  }
  return await res.json();
}
