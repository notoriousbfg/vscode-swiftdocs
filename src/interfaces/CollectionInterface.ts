import * as vscode from 'vscode';

export interface CollectionInterface {
    title: string;
    description?: string;
    owner?: string;
    items?: string[];
}