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
const CollectionModel_1 = require("./models/CollectionModel");
// export class Collection extends vscode.TreeItem implements CollectionInterface {
//     public contextValue: string;
//     public items?: Collection[];
//     constructor(label: string, contextValue: string, collapsibleState: number, items?: Collection[], resourceUri?: vscode.Uri) {
//         super(label);
//         this.contextValue = contextValue;
//         this.collapsibleState = collapsibleState;
//         this.items = items;
//         this.resourceUri = resourceUri;
//     }
// }
class CollectionProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        // this.store = [];
        this.model = new CollectionModel_1.CollectionModel();
    }
    refresh(element) {
        if (element) {
            this._onDidChangeTreeData.fire(element);
        }
        else {
            this._onDidChangeTreeData.fire();
        }
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.getChildren(element);
        });
    }
    getTreeItem(element) {
        if (element.resourceUri) {
            return {
                label: element.label,
                resourceUri: element.resourceUri,
                contextValue: element.contextValue,
                collapsibleState: element.collapsibleState,
                command: {
                    title: 'Open',
                    command: 'vscode.open',
                    arguments: [
                        element.resourceUri,
                        {
                            preview: false
                        }
                    ]
                }
            };
        }
        else {
            return {
                label: element.label,
                resourceUri: element.resourceUri,
                contextValue: element.contextValue,
                collapsibleState: element.collapsibleState
            };
        }
    }
    // substitute these methods for api connection
    addCollection(element) {
        this.model.write(element)
            .then(() => {
            this.refresh();
        });
    }
    // messy
    addFile(collection, element) {
        if (collection.items === undefined) {
            collection.items = [];
        }
        collection.items.push(element.replace(`${vscode.workspace.rootPath}/`, ''));
        this.model.write(collection)
            .then(() => {
            this.refresh();
        });
    }
}
exports.CollectionProvider = CollectionProvider;
class CollectionExplorer {
    constructor(context) {
        this.context = context;
        const collectionProvider = new CollectionProvider(context);
        const collectionExplorer = vscode.window.createTreeView('collectionExplorer', { treeDataProvider: collectionProvider });
        const addCollectionCmd = vscode.commands.registerCommand('collectionExplorer.addCollection', (e) => {
            vscode.window.showInputBox({
                placeHolder: 'The name of your Collection',
                prompt: 'A Collection is simply a way of associating files in your project. It could be the name for a piece of functionality or feature.'
            })
                .then(value => {
                if (value !== undefined) {
                    collectionProvider.addCollection({
                        title: value
                    });
                }
            });
        });
        context.subscriptions.push(addCollectionCmd);
        const assignFileCmd = vscode.commands.registerCommand('extension.assignFile', (e) => {
            collectionProvider.model.getCollections()
                .then((collections) => {
                vscode.window.showQuickPick(collections.map((element) => {
                    return element.title;
                }), {
                    placeHolder: 'Choose Collection'
                }).then(value => {
                    collectionProvider.model.getCollection(value)
                        .then((collection) => {
                        collectionProvider.addFile(collection, e.path);
                    });
                });
            });
        });
        context.subscriptions.push(assignFileCmd);
    }
}
exports.CollectionExplorer = CollectionExplorer;
//# sourceMappingURL=Collections.js.map