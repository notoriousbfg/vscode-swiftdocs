import * as vscode from 'vscode';

import { CollectionModel } from './models/CollectionModel';
import { CollectionInterface } from './interfaces/CollectionInterface';

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

export class CollectionProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | null> = new vscode.EventEmitter<vscode.TreeItem | null>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this._onDidChangeTreeData.event;

    // public store: Collection[];
    public model: CollectionModel;

    constructor(private context: vscode.ExtensionContext) {
        // this.store = [];
        this.model = new CollectionModel();
    }

    refresh(element?: CollectionInterface): void {
        if(element) {
            this._onDidChangeTreeData.fire(element);
        } else {
            this._onDidChangeTreeData.fire();
        }
    }

    async getChildren(element?: CollectionInterface): Promise<vscode.TreeItem[]> {
        return this.model.getChildren(element);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        if(element.resourceUri) {
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
        } else {
            return {
                label: element.label,
                resourceUri: element.resourceUri,
                contextValue: element.contextValue,
                collapsibleState: element.collapsibleState
            };
        }
    }

    // substitute these methods for api connection
    addCollection(element: CollectionInterface) {
        this.model.write(element)
            .then(() => {
                this.refresh();
            });
    }
    
    // messy
    addFile(collection: CollectionInterface, element: string) {
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

export class CollectionExplorer {
    constructor(private context: vscode.ExtensionContext) {
        const collectionProvider = new CollectionProvider(context);
        const collectionExplorer = vscode.window.createTreeView('collectionExplorer', { treeDataProvider: collectionProvider });

        const addCollectionCmd = vscode.commands.registerCommand('collectionExplorer.addCollection', (e) => {
            vscode.window.showInputBox({
                placeHolder: 'The name of your Collection',
                prompt: 'A Collection is simply a way of associating files in your project. It could be the name for a piece of functionality or feature.'

            })
            .then(value => {
                if(value !== undefined) {
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
                    vscode.window.showQuickPick(
                        collections.map((element) => {
                            return element.title!;
                        }
                        ), {
                            placeHolder: 'Choose Collection'
                        }).then(value => {
                            collectionProvider.model.getCollection(value as string)
                                .then((collection) => {
                                    collectionProvider.addFile(collection, e.path);
                                });
                        });
                });
        });

        context.subscriptions.push(assignFileCmd);
    }
}