import * as vscode from 'vscode';
import * as React from 'react';

import { renderToString } from 'react-dom/server';

import { SnippetModel } from './models/SnippetModel';

import WebView from './components/WebView';

export class FlowExplorer {
    constructor(private context: vscode.ExtensionContext) {
        let currentPanel: vscode.WebviewPanel | undefined = undefined;

        const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.One);
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'newFlow',
                    'SwiftDocs: New Flow',
                    vscode.ViewColumn.One,
                    {}
                );
            }

            currentPanel.webview.html = renderToString(<WebView />);

            // let editor = vscode.window.activeTextEditor;

            // if (editor !== undefined) {
            //     let snippet = new SnippetModel(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection));
            //     // open webview or focus webview
            // }
        });

        context.subscriptions.push(createSnippet);
    }
}