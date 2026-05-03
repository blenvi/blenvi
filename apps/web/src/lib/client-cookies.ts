type CookieSetOptions = {
  maxAge?: number;
  path?: string;
};

export function setClientCookie(
  name: string,
  value: string,
  options: CookieSetOptions = {},
) {
  if (!("cookieStore" in window)) return;

  const path = options.path ?? "/";
  void window.cookieStore.set({
    name,
    value,
    path,
    expires: options.maxAge ? Date.now() + options.maxAge * 1000 : undefined,
  });
}

export function deleteClientCookie(name: string, path = "/") {
  if (!("cookieStore" in window)) return;
  void window.cookieStore.delete({ name, path });
}
