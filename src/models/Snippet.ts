import * as vscode from 'vscode';
import * as uuidv4 from 'uuid/v4';

import Model from './Model';
import Wiki from './Wiki';

import ModelInterface from '../interfaces/ModelInterface';

export default class Snippet extends Model implements ModelInterface {
    public uuid: string;
    public wiki: Wiki;
    public key: string;
    public start: vscode.Position;
    public end: vscode.Position;
    public text: string;
    public file: {
        path: string;
        uri: vscode.Uri
    };
    public description?: string;

    public constructor(start: vscode.Position, end: vscode.Position, text: string, uri: vscode.Uri, wiki: Wiki) {
        super();

        this.uuid = uuidv4();
        this.wiki = wiki;
        this.key = `wikis.${this.wiki.uuid}.${this.uuid}`;
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