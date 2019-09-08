/**
 * TODO: Replace logic in this class with Config class.
 */

import { stat, writeFile, readFile } from 'fs';

import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as uuidv4 from 'uuid/v4';

import ModelInterface from '../interfaces/ModelInterface';

export default class Model implements ModelInterface {
    private filePath: string = `${vscode.workspace.rootPath}/teams.json`;
    private store: { [key: string]: any } = {};

    public uuid: string = uuidv4();
    public key: string = '';

    constructor() {
        this.createFileIfNotExists();
    }

    private createFileIfNotExists() {
        stat(this.filePath, (err, stats) => {
            if (err) {
                writeFile(this.filePath, JSON.stringify({}), () => {
                    vscode.window.showInformationMessage('File teams.json created.');
                });
            }
        });
    }

    public toObject() : {} {
        return this;
    }

    public save() {
        if(!this.key) { return; }

        // get contents of file and hold in this.store
        readFile(this.filePath, 'utf8', (err, data) => {
            if(err) { throw err; }

            if(data.length > 0) {
                this.store = JSON.parse(data);
            }

            // _.set allows us to use string to define nested objects e.g. `wikis.${wiki.title}`
            _.set(this.store, this.key, this.toObject());

            let json = JSON.stringify(this.store, null, 4);

            // write this.store back to file
            writeFile(this.filePath, json, () => {
                // empty out this.store
                this.store = {};
            });
        });
    }
}