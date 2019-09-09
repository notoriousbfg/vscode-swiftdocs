import { stat, writeFile, readFile } from 'fs';

import * as vscode from 'vscode';
import * as _ from 'lodash';

import { TreeView } from './TreeView';
// import WebView from './WebView';

import Wiki from './models/Wiki';
import Snippet from './models/Snippet';

export class Config {
    public project: string = '';
    public wikis: { [key: string]: Wiki } = {};
    public activeWiki?: Wiki = undefined;

    private filePath: string = `${vscode.workspace.workspaceFolders![0].uri.path}/teams.json`;

    // read from teams.json (if present) and load into config
    public loadFromJson() {
        return new Promise((resolve, reject) => {
            // check for presence of json file
            stat(this.filePath, (err, stats) => {
                // file does not exist
                if (err) {
                    // create file & notify user of creation
                    writeFile(this.filePath, JSON.stringify({}), () => {
                        vscode.window.showInformationMessage('File teams.json created.');
                        resolve();
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

    public setActiveWiki(wiki: Wiki) {
        this.activeWiki = wiki;
    }
}