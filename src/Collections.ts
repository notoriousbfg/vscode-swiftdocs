import * as vscode from 'vscode';

interface CollectionInterface {
    type: string;
    label?: string;
    resourceUri?: vscode.Uri;
    items?: CollectionFile[];
}

export class Collection extends vscode.TreeItem implements CollectionInterface {
    public type: string;
    public items: CollectionFile[];

    constructor(label: string) {
        super(label);
        this.type = 'collection';
        this.items = [];
        this.collapsibleState = 2;
    }
}

export class CollectionFile extends vscode.TreeItem implements CollectionInterface {
    public type: string;

    constructor(path: string) {
        super(vscode.Uri.file(path));
        this.type = 'file';
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
}

export class CollectionProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | null> = new vscode.EventEmitter<vscode.TreeItem | null>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this._onDidChangeTreeData.event;

    public store: Collection[];

    constructor(private context: vscode.ExtensionContext) {
        this.store = [];
    }

    refresh(element?: CollectionInterface): void {
        if(element) {
            this._onDidChangeTreeData.fire(element);
        } else {
            this._onDidChangeTreeData.fire();
        }
    }

    getChildren(element?: CollectionInterface): vscode.TreeItem[] {
        if(element) {
            if(element.items !== undefined) {
                return element.items;
            } else {
                return [];
            }
        }
        return this.store;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return {
            label: element.label,
            resourceUri: element.resourceUri,
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

    // substitute these methods for api connection
    addCollection(element: Collection) {
        this.store.push(element);
        this.refresh();
    }
    
    addFile(collection: Collection, element: CollectionFile) {
        collection.items.push(element);
        this.refresh(collection);
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
                    collectionProvider.addCollection(new Collection(value));
                }
            });
        });

        context.subscriptions.push(addCollectionCmd);

        const assignFileCmd = vscode.commands.registerCommand('extension.assignFile', (e) => {
            vscode.window.showQuickPick(collectionProvider.store.map((element) => {
                return element.label!;
            }), {
                placeHolder: 'Choose Collection'
            }).then(value => {
                let collection = collectionProvider.store.filter(item => { return item.label === value; })[0];
                collectionProvider.addFile(collection, new CollectionFile(e.path));
            });
        });

        context.subscriptions.push(assignFileCmd);
    }
}