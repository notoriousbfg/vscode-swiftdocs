import * as vscode from 'vscode';
import * as uuidv4 from 'uuid/v4';

import Model from './Model';
import Snippet from './Snippet';

import ModelInterface from '../interfaces/ModelInterface';

export default class Wiki extends Model implements ModelInterface {
    public title: string;
    public snippets: Snippet[];
    public uuid: string;
    public key: string;

    public constructor(options?: {}) {
        super();

        this.uuid = uuidv4();
        this.title = 'My First Wiki';
        this.snippets = [];

        this.key = `wikis.${this.uuid}`;

        if (options) {
            // TODO
        }
    }

    public setUuid(uuid: string) {
        this.uuid = uuid;
    }

    public setTitle(title: string) {
        this.title = title;
    }

    public addSnippet(snippet: Snippet) {
        this.snippets.push(snippet);
    }

    public removeSnippet(index: number) {
        this.snippets.splice(index, 1);
    }

    public setSnippets(snippets: Snippet[]) {
        this.snippets = snippets;
    }

    public toObject() : {} {
        return {
            uuid: this.uuid,
            title: this.title,
            snippets: this.snippets.map((snippet) => {
                return snippet.toObject();
            })
        };
    }
}