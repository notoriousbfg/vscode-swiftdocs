import * as vscode from 'vscode';
import { stat, writeFile } from 'fs';

import { ModelInterface } from '../interfaces/ModelInterface';
import { CollectionInterface } from '../interfaces/CollectionInterface';
import { Store } from '../interfaces/CollectionStoreInterface';

export class CollectionModel implements ModelInterface {
    private path: string = `${vscode.workspace.rootPath}/teams.json`;
    private resourceUri: vscode.Uri = vscode.Uri.file(this.path);
    private store: Store;

    constructor() {
        this.createFileIfNotExists();
        this.store = {
            project: '',
            collections: []
        };
    }

    createFileIfNotExists() {
        stat(this.path, (err, stats) => {
            if (err) {
                writeFile(this.path, JSON.stringify(this.store), () => {
                    vscode.window.showInformationMessage('File teams.json created.');
                });
            }
        });
    }

    async openFile(): Promise<Store> {
        return vscode.workspace.openTextDocument(this.resourceUri)
            .then((document) => {
                let json = JSON.parse(document.getText());

                // assigns values from json file to this.store
                Object.keys(json).map((key: string) => {
                    if(typeof (this.store as any)[key] !== undefined) {
                        (this.store as any)[key] = json[key];
                    }
                });

                return new Promise((res, rej) => {
                    return res(this.store);
                });
            });
    }

    async getCollections() {
        await this.openFile();
        return this.store.collections;
    }

    async getCollection(title: string) {
        await this.openFile();

        return this.store.collections.filter((item: CollectionInterface) => { 
            return item.title === title; 
        })[0];
    }

    async write(element: CollectionInterface): Promise<void> {
        await this.openFile();
        if(this.store.collections !== undefined) {
            return this.getCollection(element.title)
                .then((existingCollection) => {
                    if(existingCollection) {
                        let index = this.store.collections.indexOf(existingCollection);
                        this.store.collections[index] = element;
                    } else {
                        this.store.collections.push(element);
                    }

                    return writeFile(this.path, JSON.stringify(this.store), () => {
                        return Promise.resolve();
                    });
                });
        }
    }

    // converts this.store.collections into list of tree items

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        await this.getCollections();
        if(element) {
            // use label from treeitem to find relevant collection in store, then return items as treeitems
            let collection = this.store.collections.filter((collection: CollectionInterface) => {
                return collection.title === element.label;
            })[0];
            var children: vscode.TreeItem[] = [];
            if(collection.items) {
                children = collection.items.map((item: string) => {
                    return new vscode.TreeItem(vscode.Uri.file(`${vscode.workspace.rootPath}/${item}`));
                });
            }
            return new Promise((res, rej) => {
                res(children);
            });
        } else {
            // return all collections as treeitems
            return new Promise((res, rej) => {
                res(
                    this.store.collections.map((collection: CollectionInterface) => {
                        let treeItem =  new vscode.TreeItem(collection.title);
                        treeItem.collapsibleState = 2;
                        treeItem.contextValue = 'collection';
                        return treeItem;
                    })
                );
            });
        }
    }
}