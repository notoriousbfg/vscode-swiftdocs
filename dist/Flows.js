"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const SnippetModel_1 = require("./models/SnippetModel");
class FlowExplorer {
    constructor(context) {
        this.context = context;
        const createSnippet = vscode.commands.registerCommand("extension.createSnippet", (e) => {
            const editor = vscode.window.activeTextEditor;
            if (editor !== undefined) {
                let snippet = new SnippetModel_1.SnippetModel(editor.selection.start, editor.selection.end, editor.document.getText(editor.selection));
                // open webview or focus webview
                const panel = vscode.window.createWebviewPanel('newFlow', 'SwiftDocs: New Flow', vscode.ViewColumn.One, {});
            }
        });
        context.subscriptions.push(createSnippet);
    }
}
exports.FlowExplorer = FlowExplorer;
//# sourceMappingURL=Flows.js.map