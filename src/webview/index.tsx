import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import MessageBus from './messages';

import './app.css';

declare global {
    interface Window {
        workspacePath: any;
    }
}

declare var acquireVsCodeApi: any;

const vscode = acquireVsCodeApi();

let messageBus = new MessageBus(vscode);

ReactDOM.render(
    <App message={messageBus} vscode={vscode} />,
    document.getElementById('root')
);