import * as React from 'react';

import Snippet from '../../models/Snippet';
import MessageBus from '../messages';

import Modal from './Modal';

import './App.css';

interface WebViewProps {
    message: MessageBus;
    vscode: any; // ?
}

interface WebViewState {
    title: string;
    snippets: Snippet[];
    showModal: boolean;
    selectedSnippet?: Snippet;
}

export default class App extends React.Component<WebViewProps, WebViewState> {
    constructor(props: WebViewProps) {
        super(props);
        this.state = this.props.vscode.getState() || {
            title: '',
            snippets: [],
            showModal: false
        };
    }

    changeTitle(event: React.ChangeEvent<HTMLInputElement>) {
        let title = event.target.value;
        this.setState({ title: title });
        // send message to server
        this.props.message.send({
            type: 'updateTitle',
            title: title
        });
    }

    handleSubmit(snippet: Snippet) {
        let snippets = this.state.snippets;
        snippets.push(snippet);
        this.setState({ snippets: snippets });

        console.log(snippet.description);

        this.props.message.send({
            type: 'updateSnippets',
            snippets: this.state.snippets
        });

        this.setState({ showModal: false });
    }

    componentDidUpdate(oldProps: WebViewProps, oldState: WebViewState) {
        // update vscode state with react state
        this.props.vscode.setState(this.state);
    }

    componentDidMount() {
        this.props.message.on('addSnippet', (message) => {
            let snippet = new Snippet(message.snippet.start, message.snippet.end, message.snippet.text);

            // show modal
            this.setState({ 
                showModal: true,
                selectedSnippet: snippet
            });            
        });
    }

    render () {
        return (
            <div className="app-container">
                <input type="text" name="title" className="title-input" onChange={(e) => { this.changeTitle(e); }} defaultValue={this.state.title} placeholder="Wiki Title" />
                {this.state.snippets.length > 0 &&
                    <ul className="snippet-list">
                        {
                            this.state.snippets.map((snippet, key) => {
                                return (
                                    <li className="snippet" key={key}>
                                        {snippet.description && 
                                        <p>{snippet.description}</p>
                                        }
                                        <pre>{snippet.text}</pre>
                                    </li>
                                );
                            })
                        }
                    </ul>                
                }
                {this.state.showModal &&
                    <Modal snippet={this.state.selectedSnippet} handleSubmit={(snippet: Snippet) => { this.handleSubmit(snippet); }} />
                }
            </div>
        );
    }
}