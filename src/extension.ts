// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Config } from './SwiftDocs';

import WikiSerializer from './serializers/WikiSerializer';
import { TreeView } from './TreeView';
import { WebView } from './WebView';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const config = new Config();
    const treeView = new TreeView(context);
    const webView = new WebView(context);

    config.loadFromJson()
        .then(() => {
            treeView.initialise(config);

            const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
                webView.initialise();
            });

            context.subscriptions.push(createSnippet);

            vscode.window.registerWebviewPanelSerializer('swiftDocs', new WikiSerializer());
        });
}

// this method is called when your extension is deactivated
export function deactivate() {}
