import * as vscode from 'vscode';
import * as path from 'path';
import * as React from 'react';
import { EventEmitter } from 'events';

import { renderToString } from 'react-dom/server';

import Snippet from './models/Snippet';
import Wiki from './models/Wiki';

import { WikiSerializer } from './serializers/WikiSerializer';

export class WikiExplorer {
    constructor(private context: vscode.ExtensionContext) {
        let currentPanel: vscode.WebviewPanel | undefined = undefined;
        let events: EventEmitter = new EventEmitter();
        let wiki: Wiki | undefined = new Wiki();
        let ready: Boolean = false;

        const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
            const columnToShowIn = vscode.ViewColumn.Beside;
            let firstRender = true;

            if (currentPanel) {
                currentPanel.reveal(columnToShowIn);
                firstRender = false;
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'newWiki',
                    'SwiftDocs: New Wiki',
                    columnToShowIn,
                    {
                        enableScripts: true
                    }
                );
            }

            let editor = vscode.window.activeTextEditor;
            let snippet: Snippet;

            if (editor !== undefined) {
                // create snippet from current selection
                snippet = new Snippet(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection));

                // send snippet to webview so it can be rendered
                if(!ready) {
                    events.once('ready', () => {
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({
                                type: 'addSnippet',
                                snippet: snippet
                            });
                        }
                    });
                } else {
                    currentPanel.webview.postMessage({
                        type: 'addSnippet',
                        snippet: snippet
                    });
                }
            }

            if(firstRender) {
                const scriptSrc = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.js')).with({ scheme: 'vscode-resource' });
                const cssSrc = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.css')).with({ scheme: 'vscode-resource' });

                const page = (
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <link rel="stylesheet" href={cssSrc.toString()} />
                        </head>
                        <body>
                            <div id="root"></div>
                            <script src={scriptSrc.toString()}></script>
                        </body>
                    </html>
                );

                currentPanel.webview.html = renderToString(page);
            }

            // when we receive panel from webview
            currentPanel.webview.onDidReceiveMessage(
                message => {
                    events.emit(message.type, message);

                    switch (message.type) {
                        case 'ready':
                            ready = true;
                            break;
                        case 'updateTitle':
                            if(wiki !== undefined) {
                                wiki.setTitle(message.title);
                            }
                            break;
                        case 'addSnippet':
                            if (wiki !== undefined) {
                                wiki.addSnippet(message.snippet);
                            }
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
                    wiki = undefined;
                },
                null,
                context.subscriptions
            );
        });

        context.subscriptions.push(createSnippet);

        vscode.window.registerWebviewPanelSerializer('swiftDocs', new WikiSerializer());
    }
}