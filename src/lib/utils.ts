export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function splitUrls(val: string | undefined | null): string[] {
  if (!val) return [];
  return val.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
}

export function deriveLinkLabel(url: string, base: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    if (/railway\.(com|app)|heroku|fly\.(io|dev)|render\.com/.test(host)) return `${base} · Backend`;
    if (/vercel\.com|netlify\.com|pages\.cloudflare/.test(host))           return `${base} · Web`;
    if (/backend|\/api|-api|-server|\/server/.test(path))                  return `${base} · Backend`;
    if (/mobile|\bios\b|\bandroid\b|native|-app(?![a-z])|app$/.test(path)) return `${base} · App`;
    if (/frontend|-web|\/web/.test(path))                                  return `${base} · Web`;
  } catch { /* not a valid URL — fall through */ }
  return base;
}

export function timeAgo(ts: string | Date | null | undefined): string {
  if (!ts) return "never";
  const then = typeof ts === "string" ? new Date(ts) : ts;
  const d = Math.floor((Date.now() - then.getTime()) / 1000);
  if (d < 60)        return "just now";
  if (d < 3600)      return Math.floor(d / 60) + "m ago";
  if (d < 86400)     return Math.floor(d / 3600) + "h ago";
  if (d < 86400*30)  return Math.floor(d / 86400) + "d ago";
  if (d < 86400*365) return Math.floor(d / (86400 * 30)) + "mo ago";
  return Math.floor(d / (86400 * 365)) + "y ago";
}

export function linkifyNotes(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/(https?:\/\/[^\s)]+)/g, (m) =>
    `<a href="${m}" target="_blank" rel="noopener" class="underline text-sage hover:text-accent">${m}</a>`);
}
