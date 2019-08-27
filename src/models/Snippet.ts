import * as vscode from 'vscode';
import { ModelInterface } from '../interfaces/ModelInterface';

export default class Snippet implements ModelInterface {
    public start: vscode.Position;
    public end: vscode.Position;
    public text: string;
    public description?: string;

    public constructor(start: vscode.Position, end: vscode.Position, text: string) {
        this.start = start;
        this.end = end;
        this.text = text;
    }

    public setDescription(description: string) {
        this.description = description;
    }
}