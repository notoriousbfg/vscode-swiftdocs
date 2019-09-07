import * as vscode from 'vscode';

import Model from './Model';

// import ModelInterface from '../interfaces/ModelInterface';

export default class Snippet {
    public start: vscode.Position;
    public end: vscode.Position;
    public text: string;
    public file: {
        path: string;
        uri: vscode.Uri
    };
    // public key: string;
    public description?: string;

    public constructor(start: vscode.Position, end: vscode.Position, text: string, uri: vscode.Uri) {
        // super();

        this.start = start;
        this.end = end;
        this.text = text;
        this.file = {
            path: uri.path,
            uri: uri
        };

        // a relatively safe attempt at a unique string
        // this.key = `${new Date().getTime()}.${this.file.path}.${this.start.line}.${this.end.line}`;
    }

    public setDescription(description: string) {
        this.description = description;
    }

    public toObject() : {} {
        return {
            text: this.text,
            description: this.description,
            start: this.start,
            end: this.end,
            file: this.file
        };
    }
}