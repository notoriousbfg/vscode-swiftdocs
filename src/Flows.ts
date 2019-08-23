import * as vscode from 'vscode';

import { SnippetModel } from './models/SnippetModel';

export class FlowExplorer {
    constructor(private context: vscode.ExtensionContext) {
        const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
            const editor = vscode.window.activeTextEditor;

            if(editor !== undefined) {
                let snippet = new SnippetModel(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection));
                // open webview or focus webview
                const panel = vscode.window.createWebviewPanel(
                    'newFlow',
                    'SwiftDocs: New Flow',
                    vscode.ViewColumn.One,
                    {}
                );
            }
        });

        context.subscriptions.push(createSnippet);
    }
}