import { NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

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

  // Write prompt to a temp file to avoid shell escaping issues
  const promptDir = join(tmpdir(), "wang-work-brain");
  mkdirSync(promptDir, { recursive: true });
  const promptFile = join(promptDir, `prompt-${Date.now()}.md`);
  writeFileSync(promptFile, prompt, "utf-8");

  let cdCommand: string;

  if (localPath && typeof localPath === "string") {
    if (!pathPattern.test(localPath)) {
      return NextResponse.json({ error: "Invalid local path" }, { status: 400 });
    }
    const expandedPath = localPath.startsWith("~")
      ? `$HOME${localPath.slice(1)}`
      : localPath;
    cdCommand = `cd "${expandedPath}"`;
  } else if (repoUrl && typeof repoUrl === "string") {
    if (!/^https:\/\/github\.com\/[\w.\-]+\/[\w.\-]+\/?$/.test(repoUrl)) {
      return NextResponse.json({ error: "Invalid repo URL" }, { status: 400 });
    }
    const repoName = repoUrl.replace(/\/$/, "").split("/").pop()!;
    cdCommand = `cd "$HOME/Projects" && git clone "${repoUrl}" 2>/dev/null; cd "${repoName}"`;
  } else {
    return NextResponse.json({ error: "Need localPath or repoUrl" }, { status: 400 });
  }

  // Launch interactive claude session with the prompt file contents as initial message
  // --dangerously-skip-permissions: no approval prompts, just executes
  const shellScript = `${cdCommand} && cat "${promptFile}" | /opt/homebrew/bin/claude --dangerously-skip-permissions`;

  // Use osascript to open a new Terminal.app window
  const osa = `tell application "Terminal"
  activate
  do script "${shellScript.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
end tell`;

  return new Promise<NextResponse>((resolve) => {
    exec(`osascript -e '${osa.replace(/'/g, "'\\''")}'`, (err) => {
      if (err) {
        resolve(NextResponse.json({ error: "Failed to launch terminal", detail: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ ok: true }));
      }
    });
  });
}
