import { EventEmitter } from 'events';
import { readFile, stat } from 'fs';

import * as vscode from 'vscode';
import * as path from 'path';
import * as React from 'react';

import { Config } from './SwiftDocs';

import Snippet from './models/Snippet';
import Wiki from './models/Wiki';

export class WebView {
    private currentPanel: vscode.WebviewPanel | undefined = undefined;
    private wiki: Wiki | undefined = undefined;
    private events: EventEmitter = new EventEmitter();
    private webviewReady: Boolean = false;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        this.events.on('updateTitle', (message) => this.updateTitle(message));
        this.events.on('addSnippet', (message) => this.addSnippet(message));
        this.events.on('goToFile', (message) => this.goToFile(message));
    }

    initialise(wiki?: Wiki) {
        const columnToShowIn = vscode.ViewColumn.Beside;
        
        let editor = vscode.window.activeTextEditor!;
        let snippet: Snippet;
        let firstRender = true;

        if(wiki) {
            this.wiki = wiki;
        } else {
            this.wiki = new Wiki();
        }

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

            this.registerEvents();
        }

        // create snippet from current selection
        snippet = new Snippet(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection), editor.document.uri, this.wiki);

        // send snippet to webview so it can be rendered
        if (!this.webviewReady) {
            this.events.once('ready', (event) => this.onReady(snippet));
        } else {
            this.currentPanel.webview.postMessage({
                type: 'addSnippet',
                snippet: snippet
            });
        }

        if (firstRender) {
            this.currentPanel.webview.html = this.getWebViewContent();
        }
    }

    private getWebViewContent() {
        const scriptSrc = vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'webview.js')).with({ scheme: 'vscode-resource' });
        const cssSrc = vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'webview.css')).with({ scheme: 'vscode-resource' });

        const workspacePaths: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;

        return `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="stylesheet" href="${cssSrc.toString()}" />
                </head>
                <body>
                    <div id="root"></div>
                    <script>
                        window.workspacePath = "${workspacePaths![0].uri.path.toString()}";
                    </script>
                    <script src="${scriptSrc.toString()}"></script>
                </body>
            </html>
        `;
    }

    private registerEvents() {
        // when we receive panel from webview
        this.currentPanel!.webview.onDidReceiveMessage(
            (message) => this.onDidReceiveMessage(message),
            undefined,
            this.context.subscriptions
        );

        // when panel state changes
        this.currentPanel!.onDidChangeViewState(
            () => this.onDidChangeViewState(),
            null,
            this.context.subscriptions
        );

        // when panel is closed
        this.currentPanel!.onDidDispose(
            () => this.onDidDispose(),
            null,
            this.context.subscriptions
        );
    }

    private onDidReceiveMessage(message: { [key: string]: any }) {
        this.events.emit(message.type, message);
    }

    private onDidChangeViewState() {
        // panel is visible but not focussed
        if (this.currentPanel!.visible && !this.currentPanel!.active) {
            this.webviewReady = true;
            // panel is not visible
        } else if (!this.currentPanel!.visible) {
            this.webviewReady = false;
        }
    }

    private onDidDispose() {
        this.currentPanel = undefined;
        this.wiki = undefined;
        this.webviewReady = false;
    }

    private onReady(snippet: Snippet) {
        this.currentPanel!.webview.postMessage({
            type: 'addSnippet',
            snippet: snippet
        });
        this.webviewReady = true;
    }

    private updateTitle(message: { [key: string]: any }) {
        this.wiki!.setTitle(message.title);
        this.wiki!.save();
    }

    private addSnippet(message: { [key: string]: any }) {
        let snippet = new Snippet(
            new vscode.Position(message.snippet.start.line, message.snippet.start.character),
            new vscode.Position(message.snippet.end.line, message.snippet.end.character),
            message.snippet.text,
            vscode.Uri.file(message.snippet.file.path),
            this.wiki!
        );
        this.wiki!.addSnippet(snippet);
        this.wiki!.save();
    }

    private goToFile(message: { [key: string]: any }) {
        vscode.workspace.openTextDocument(vscode.Uri.file(message.snippet.file.path))
            .then((doc) => {
                vscode.window.showTextDocument(doc, {
                    selection: new vscode.Range(
                        new vscode.Position(message.snippet.start.line, message.snippet.start.character),
                        new vscode.Position(message.snippet.end.line, message.snippet.end.character)
                    )
                });
            });
    }
}