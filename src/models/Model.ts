import { stat, writeFile } from 'fs';

import * as vscode from 'vscode';

import { ModelInterface } from "../interfaces/ModelInterface";

export default class Model implements ModelInterface {
    public id: string = ''; // children will need a way of creating unique id
    public filePath: string = `${vscode.workspace.rootPath}/teams.json`;

    constructor() {
        this.createFileIfNotExists();
    }

    private createFileIfNotExists() {
        stat(this.filePath, (err, stats) => {
            if (err) {
                this.save();
                vscode.window.showInformationMessage('File teams.json created.');
            }
        });
    }

    public toJson() : string {
        return JSON.stringify(this, null, 4);
    }

    public save() {
        // write to teams.json
        writeFile(this.filePath, this.toJson(), () => {
            //
        });
    }
}