"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs_1 = require("fs");
class CollectionModel {
    constructor() {
        this.path = `${vscode.workspace.rootPath}/teams.json`;
        this.resourceUri = vscode.Uri.file(this.path);
        this.createFileIfNotExists();
        this.store = {
            project: '',
            collections: []
        };
    }
    createFileIfNotExists() {
        fs_1.stat(this.path, (err, stats) => {
            if (err) {
                fs_1.writeFile(this.path, JSON.stringify(this.store), () => {
                    vscode.window.showInformationMessage('File teams.json created.');
                });
            }
        });
    }
    openFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.workspace.openTextDocument(this.resourceUri)
                .then((document) => {
                let json = JSON.parse(document.getText());
                // assigns values from json file to this.store
                Object.keys(json).map((key) => {
                    if (typeof this.store[key] !== undefined) {
                        this.store[key] = json[key];
                    }
                });
                return new Promise((res, rej) => {
                    return res(this.store);
                });
            });
        });
    }
    getCollections() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openFile();
            return this.store.collections;
        });
    }
    getCollection(title) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openFile();
            return this.store.collections.filter((item) => {
                return item.title === title;
            })[0];
        });
    }
    write(element) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openFile();
            if (this.store.collections !== undefined) {
                return this.getCollection(element.title)
                    .then((existingCollection) => {
                    if (existingCollection) {
                        let index = this.store.collections.indexOf(existingCollection);
                        this.store.collections[index] = element;
                    }
                    else {
                        this.store.collections.push(element);
                    }
                    return fs_1.writeFile(this.path, JSON.stringify(this.store), () => {
                        return Promise.resolve();
                    });
                });
            }
        });
    }
    // converts this.store.collections into list of tree items
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getCollections();
            if (element) {
                // use label from treeitem to find relevant collection in store, then return items as treeitems
                let collection = this.store.collections.filter((collection) => {
                    return collection.title === element.label;
                })[0];
                var children = [];
                if (collection.items) {
                    children = collection.items.map((item) => {
                        return new vscode.TreeItem(vscode.Uri.file(`${vscode.workspace.rootPath}/${item}`));
                    });
                }
                return new Promise((res, rej) => {
                    res(children);
                });
            }
            else {
                // return all collections as treeitems
                return new Promise((res, rej) => {
                    res(this.store.collections.map((collection) => {
                        let treeItem = new vscode.TreeItem(collection.title);
                        treeItem.collapsibleState = 2;
                        treeItem.contextValue = 'collection';
                        return treeItem;
                    }));
                });
            }
        });
    }
}
exports.CollectionModel = CollectionModel;
//# sourceMappingURL=CollectionModel.js.map