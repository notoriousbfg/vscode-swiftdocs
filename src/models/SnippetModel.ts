import * as vscode from 'vscode';
import { SnippetInterface } from '../interfaces/SnippetInterface';

export class SnippetModel implements SnippetInterface {
    public start: vscode.Position;
    public end: vscode.Position;
    public text: string;

    public constructor(start: vscode.Position, end: vscode.Position, text: string) {
        this.start = start;
        this.end = end;
        this.text = text;
    }
}