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

            const onDiskPath = vscode.Uri.file(
                path.join(context.extensionPath, 'dist', 'webview.js')
            );

            const scriptSrc = onDiskPath.with({ scheme: 'vscode-resource' });

            const page = (
                <html>
                    <head>
                        <script src={scriptSrc.toString()} defer></script>
                    </head>
                    <body>
                        <div id="root"></div>
                    </body>
                </html>
            );

            currentPanel.webview.html = renderToString(page);

            currentPanel.webview.onDidReceiveMessage(
                message => {
                    switch (message.type) {
                        case 'updateTitle':
                            wiki.setTitle(message.title);
                            console.log(wiki.title);
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );

            currentPanel.onDidDispose(
                () => {
                    // so that new panels can be created
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );

            let editor = vscode.window.activeTextEditor;
            let snippet: Snippet;

            if (editor !== undefined) {
                snippet = new Snippet(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection));

                currentPanel.webview.postMessage({
                    type: 'addSnippet',
                    snippet: snippet
                });
            }
        });

        context.subscriptions.push(createSnippet);

        vscode.window.registerWebviewPanelSerializer('swiftDocs', new WikiSerializer());
    }
}