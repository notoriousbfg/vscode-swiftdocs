import * as vscode from 'vscode';
import * as path from 'path';
import * as React from 'react';
import { EventEmitter } from 'events';

import { renderToString } from 'react-dom/server';

import Snippet from './models/Snippet';
import Wiki from './models/Wiki';

import { WikiSerializer } from './serializers/WikiSerializer';

export class WikiExplorer {
    private currentPanel: vscode.WebviewPanel | undefined = undefined;
    private wiki: Wiki | undefined = new Wiki();
    private events: EventEmitter = new EventEmitter();
    private webviewReady: Boolean = false;

    constructor(context: vscode.ExtensionContext) {
        const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
            this.initialise(context, e);
        });

        context.subscriptions.push(createSnippet);

        vscode.window.registerWebviewPanelSerializer('swiftDocs', new WikiSerializer());
    }

    initialise(context: vscode.ExtensionContext, event: Event) {
        const columnToShowIn = vscode.ViewColumn.Beside;
        const editor = vscode.window.activeTextEditor;
        
        let snippet: Snippet;
        let firstRender = true;

        if (this.currentPanel) {
            this.currentPanel.reveal(columnToShowIn);
            firstRender = false;
        } else {
            this.currentPanel = vscode.window.createWebviewPanel(
                'newWiki',
                'SwiftDocs: New Wiki',
                columnToShowIn,
                {
                    enableScripts: true
                }
            );
        }

        if (editor !== undefined) {
            // create snippet from current selection
            snippet = new Snippet(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection), editor.document.uri);

            // send snippet to webview so it can be rendered
            if (!this.webviewReady) {
                this.events.once('ready', () => {
                    if (this.currentPanel !== undefined) {
                        this.currentPanel.webview.postMessage({
                            type: 'addSnippet',
                            snippet: snippet
                        });
                    }
                    this.webviewReady = true;
                });
            } else {
                this.currentPanel.webview.postMessage({
                    type: 'addSnippet',
                    snippet: snippet
                });
            }
        }

        if (firstRender) {
            const scriptSrc = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.js')).with({ scheme: 'vscode-resource' });
            const cssSrc = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.css')).with({ scheme: 'vscode-resource' });
            const workspacePaths: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;

            const page = (
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <link rel="stylesheet" href={cssSrc.toString()} />
                    </head>
                    <body>
                        <div id="root"></div>
                        {workspacePaths !== undefined &&
                            // not entirely satisfied with this
                            <script dangerouslySetInnerHTML={{ __html: "window.workspacePath = '" + workspacePaths[0].uri.path.toString() + "'" }}></script>                        
                        }
                        <script src={scriptSrc.toString()}></script>
                    </body>
                </html>
            );

            this.currentPanel.webview.html = renderToString(page);
        }

        // when we receive panel from webview
        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                this.events.emit(message.type, message);

                switch (message.type) {
                    case 'webviewReady':
                        this.webviewReady = true;
                        break;
                    case 'updateTitle':
                        if (this.wiki !== undefined) {
                            this.wiki.setTitle(message.title);
                        }
                        break;
                    case 'addSnippet':
                        if (this.wiki !== undefined) {
                            this.wiki.addSnippet(message.snippet);
                        }
                        break;
                    case 'goToFile':
                        vscode.workspace.openTextDocument(vscode.Uri.file(message.snippet.file.path))
                            .then((doc) => {
                                vscode.window.showTextDocument(doc, {
                                    selection: new vscode.Range(
                                        new vscode.Position(message.snippet.start.line, message.snippet.start.character),
                                        new vscode.Position(message.snippet.end.line, message.snippet.end.character)
                                    )
                                });
                            });
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // when panel is closed
        this.currentPanel.onDidDispose(
            () => {
                this.currentPanel = undefined;
                this.wiki = undefined;
            },
            null,
            context.subscriptions
        );
    }
}