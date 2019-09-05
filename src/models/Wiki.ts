import * as vscode from 'vscode';

import Model from './Model';
import { ModelInterface } from '../interfaces/ModelInterface';

import Snippet from './Snippet';

export default class Wiki extends Model implements ModelInterface {
    public id: string = '';
    public title: string;
    public snippets: Snippet[];

    public constructor(options?: {}) {
        super();

        this.title = '';
        this.snippets = [];

        if (options) {
            // for(let [key, value] of Object.entries(options)) {
            //     console.log([key, value]);

            //     // if (typeof this[key] !== undefined) {

            //     // }
            // }
        }
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

    public toJson() : string {
        return JSON.stringify(
            {
                title: this.title,
                snippets: this.snippets
            }
        , null, 4);
    }
}