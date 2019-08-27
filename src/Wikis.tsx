import * as vscode from 'vscode';
import * as path from 'path';
import * as React from 'react';

import { renderToString } from 'react-dom/server';

import Snippet from './models/Snippet';
import Wiki from './models/Wiki';

import App from './webview/components/App';

import { WikiSerializer } from './serializers/WikiSerializer';

export class WikiExplorer {
    constructor(private context: vscode.ExtensionContext) {
        let currentPanel: vscode.WebviewPanel | undefined = undefined;
        let wiki = new Wiki();

        const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
            if (currentPanel) {
                const columnToShowIn = vscode.window.activeTextEditor
                    ? vscode.window.activeTextEditor.viewColumn
                    : undefined;

                currentPanel.reveal(columnToShowIn);
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'newWiki',
                    'SwiftDocs: New Wiki',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
            }

            const scriptSrc = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.js')).with({ scheme: 'vscode-resource' });

            const page = (
                <html>
                    <body>
                        <div id="root"></div>
                        <script src={scriptSrc.toString()}></script>
                    </body>
                </html>
            );

            currentPanel.webview.html = renderToString(page);

            let editor = vscode.window.activeTextEditor;
            let snippet: Snippet;

            if (editor !== undefined) {
                // create snippet from current selection
                snippet = new Snippet(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection));

                // attach snippet to wiki
                wiki.addSnippet(snippet);

                // send snippet to webview so it can be rendered
                currentPanel.webview.postMessage({
                    type: 'addSnippet',
                    snippet: snippet
                });
            }

            // when we receive panel from webview
            currentPanel.webview.onDidReceiveMessage(
                message => {
                    switch (message.type) {
                        case 'updateTitle':
                            wiki.setTitle(message.title);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );

            // when panel is closed
            currentPanel.onDidDispose(
                () => {
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );
        });

        context.subscriptions.push(createSnippet);

        vscode.window.registerWebviewPanelSerializer('swiftDocs', new WikiSerializer());
    }
}