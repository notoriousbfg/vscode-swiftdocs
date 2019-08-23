import { Position } from 'vscode';

export interface SnippetInterface {
    start: Position;
    end: Position;
    text: string;
}