import * as vscode from 'vscode';

import { CollectionInterface } from './CollectionInterface';

export interface Store {
    project: string;
    collections: CollectionInterface[];
}