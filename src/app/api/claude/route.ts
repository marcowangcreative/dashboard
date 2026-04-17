import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(req: Request) {
  // Only allow in development — never spawn local processes from production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Only available in local development" }, { status: 403 });
  }

  const { prompt, localPath, repoUrl } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  // Sanitize: only allow paths that start with ~ or / and contain no shell metacharacters
  const pathPattern = /^[~\/][\w\/.\-_ ]+$/;

  let shellScript: string;

  if (localPath && typeof localPath === "string") {
    if (!pathPattern.test(localPath)) {
      return NextResponse.json({ error: "Invalid local path" }, { status: 400 });
    }
    // Expand ~ to $HOME in the shell
    const expandedPath = localPath.startsWith("~")
      ? `$HOME${localPath.slice(1)}`
      : localPath;
    shellScript = `cd "${expandedPath}" && claude --prompt ${JSON.stringify(prompt)}`;
  } else if (repoUrl && typeof repoUrl === "string") {
    // Validate repo URL is a GitHub URL
    if (!/^https:\/\/github\.com\/[\w.\-]+\/[\w.\-]+\/?$/.test(repoUrl)) {
      return NextResponse.json({ error: "Invalid repo URL" }, { status: 400 });
    }
    const repoName = repoUrl.replace(/\/$/, "").split("/").pop()!;
    shellScript = `cd ~/Projects && git clone "${repoUrl}" 2>/dev/null; cd "${repoName}" && claude --prompt ${JSON.stringify(prompt)}`;
  } else {
    return NextResponse.json({ error: "Need localPath or repoUrl" }, { status: 400 });
  }

  // Use osascript to open a new Terminal.app window
  const osa = `tell application "Terminal"
  activate
  do script ${JSON.stringify(shellScript)}
end tell`;

  return new Promise<NextResponse>((resolve) => {
    exec(`osascript -e ${JSON.stringify(osa)}`, (err) => {
      if (err) {
        resolve(NextResponse.json({ error: "Failed to launch terminal", detail: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ ok: true }));
      }
    });
  });
}
