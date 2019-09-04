import * as vscode from 'vscode';

import Model from './Model';
import { ModelInterface } from '../interfaces/ModelInterface';

export default class Snippet {
    public start: vscode.Position;
    public end: vscode.Position;
    public text: string;
    public file: {
        path: string;
        uri: vscode.Uri
    };
    public description?: string;

    public constructor(start: vscode.Position, end: vscode.Position, text: string, uri: vscode.Uri) {
        this.start = start;
        this.end = end;
        this.text = text;
        this.file = {
            path: uri.path,
            uri: uri
        };
    }

    public setDescription(description: string) {
        this.description = description;
    }
}