import * as vscode from 'vscode';

export class WikiSerializer implements vscode.WebviewPanelSerializer {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        // `state` is the state persisted using `setState` inside the webview
        console.log(`Got state: ${state}`);

        // Restore the content of our webview.
        //
        // Make sure we hold on to the `webviewPanel` passed in here and
        // also restore any event listeners we need on it.
        // webviewPanel.webview.html = getWebviewContent();
    }
}