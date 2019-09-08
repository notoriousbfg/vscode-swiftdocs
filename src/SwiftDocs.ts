import { stat, writeFile, readFile } from 'fs';

import * as vscode from 'vscode';
import * as _ from 'lodash';

import TreeView from './TreeView';
import WebView from './WebView';

import Wiki from './models/Wiki';
import Snippet from './models/Snippet';

export class SwiftDocs {
    private treeView: TreeView;
    private webView: WebView;
    
    public config: Config;
    public activeWiki?: Wiki;

    constructor(context: vscode.ExtensionContext) {
        this.config = new Config();

        this.treeView = new TreeView(context);
        this.webView = new WebView(context);
    }

    public async initialise() {
        await this.config.loadFromJson();
        
        // this.treeView.initialise(this.config);
        // this.webView.initialise(this.activeWiki);
    }
}

export class Config {
    public project: string = '';
    public wikis: { [key: string]: Wiki } = {};

    private filePath: string = `${vscode.workspace.rootPath}/teams.json`;

    // read from teams.json (if present) and load into config
    public loadFromJson() {
        return new Promise((reject, resolve) => {
            // check for presence of json file
            stat(this.filePath, (err, stats) => {
                // file does not exist
                if (err) {
                    // create file & notify user of creation
                    writeFile(this.filePath, JSON.stringify({}), () => {
                        vscode.window.showInformationMessage('File teams.json created.');
                    });
                } else {
                    readFile(this.filePath, 'utf8', (err, data) => {
                        if (err) { throw err; }

                        let json = JSON.parse(data);

                        if (json.wikis) {
                            _.map(json.wikis, (w, uuid) => {
                                let wiki = new Wiki();
                                wiki.setUuid(uuid);
                                wiki.setTitle(w.title);

                                if (w.snippets) {
                                    _.map(w.snippets, (s, uuid) => {
                                        let snippet = new Snippet(
                                            new vscode.Position(s.start.line, s.start.character),
                                            new vscode.Position(s.end.line, s.end.character),
                                            s.text,
                                            vscode.Uri.file(s.file.path),
                                            wiki
                                        );
                                        wiki.addSnippet(snippet);
                                    });
                                }

                                this.wikis[uuid] = wiki;
                            });
                        }

                        resolve();
                    });
                }
            }); 
        });
    }

    public save() {
        
    }
}