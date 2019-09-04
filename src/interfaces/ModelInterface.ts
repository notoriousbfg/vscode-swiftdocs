import * as vscode from 'vscode';

export interface ModelInterface {
    toJson: Function;
    save: Function;
    id: string;
}