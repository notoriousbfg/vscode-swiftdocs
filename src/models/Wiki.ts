import * as vscode from 'vscode';

import { ModelInterface } from '../interfaces/ModelInterface';

import Snippet from './Snippet';

export default class Wiki implements ModelInterface {
    public title: string;
    public snippets: Snippet[];

    public constructor() {
        this.title = '';
        this.snippets = [];
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
}