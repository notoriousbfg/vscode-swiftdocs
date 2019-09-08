// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { SwiftDocs } from './SwiftDocs';
import WebView from './WebView';

import WikiSerializer from './serializers/WikiSerializer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const main = new SwiftDocs(context);

    const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
        main.initialise();
    });

    context.subscriptions.push(createSnippet);

    vscode.window.registerWebviewPanelSerializer('swiftDocs', new WikiSerializer());
}

// this method is called when your extension is deactivated
export function deactivate() {}
