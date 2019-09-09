import * as vscode from 'vscode';
import * as _ from 'lodash';

import { Config } from './SwiftDocs';

import Wiki from './models/Wiki';
import Snippet from './models/Snippet';

export class TreeView {
    private config: Config = new Config();

    constructor(context: vscode.ExtensionContext) {

    }

    public initialise(config: Config) {
        this.config = config;

        vscode.window.createTreeView('wikiExplorer', {
            treeDataProvider: new TreeViewProvider(this.config)
        });
    }
}

export class TreeViewProvider {
    private config: Config;
    
    constructor(config: Config) {
        this.config = config;
    }

    public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
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
        } else {
            return {
                label: element.label,
                resourceUri: element.resourceUri,
                contextValue: element.contextValue,
                collapsibleState: element.collapsibleState
            };
        }
    }

    public getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        return new Promise((resolve, reject) => {
            if (element) {
                // return all files belonging to a wiki
                // get unique files from snippets
                let wiki = _.find(this.config.wikis, (wiki: Wiki): boolean => {
                    return wiki.title === element.label;
                });

                if(wiki) {
                    let files: string[] = [];
                    _.map(wiki.snippets, (snippet: Snippet) => {
                        if(files.indexOf(snippet.file.path) < 0) {
                            files.push(snippet.file.path);
                        }
                    });
                    let children = _.map(files, (file) => {
                        return new vscode.TreeItem(vscode.Uri.file(`${file}`));
                    });
                    resolve(children);
                } else {
                    reject(new Error(`No Wiki with title ${element.label} exists.`));
                }
            } else {
                resolve(
                    _.map(this.config.wikis, (wiki: Wiki) => {
                        let treeItem = new vscode.TreeItem(wiki.title);
                        treeItem.collapsibleState = 2;
                        treeItem.contextValue = 'wiki';
                        return treeItem;
                    })
                );
            }
        });
    }
}