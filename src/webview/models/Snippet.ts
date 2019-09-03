import * as vscode from 'vscode';

export default class Snippet {
    public start: vscode.Position;
    public end: vscode.Position;
    public text: string;
    public file: {
        path: string;
    };
    public description?: string;

    public constructor(start: vscode.Position, end: vscode.Position, text: string, path: string) {
        this.start = start;
        this.end = end;
        this.text = text;
        this.file = {
            path: path
        };
    }

    public setDescription(description: string) {
        this.description = description;
    }
}