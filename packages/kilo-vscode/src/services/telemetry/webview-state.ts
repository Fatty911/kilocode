import * as vscode from "vscode"

/**
 * Push the current VS Code telemetry-enabled flag to a webview. Called on
 * webview ready / re-sync so the webview can gate feedback UI on the flag.
 */
export function pushTelemetryState(post: (msg: { type: "telemetryState"; enabled: boolean }) => void): void {
  post({ type: "telemetryState", enabled: vscode.env.isTelemetryEnabled })
}
