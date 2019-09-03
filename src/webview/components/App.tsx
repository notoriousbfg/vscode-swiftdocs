import * as React from 'react';

import Wiki from '../../models/Wiki';
import Snippet from '../../models/Snippet';
import MessageBus from '../messages';

import Modal from './Modal';

import VSCodeState from '../state';

interface WebViewProps {
    message?: MessageBus;
    vscode?: any;
}

interface WebViewState {
    wiki: Wiki;
    showModal: boolean;
    selectedSnippet?: Snippet;
}

export default class App extends React.Component<WebViewProps, WebViewState> {
    private codeState: VSCodeState;

    constructor(props: WebViewProps) {
        super(props);

        this.codeState = new VSCodeState(this.props.vscode);

        this.state = {
            wiki: new Wiki(),
            showModal: false
        };
    }

    changeTitle(event: React.ChangeEvent<HTMLInputElement>) {
        if(!this.props.message) {
            return;
        }

        let title = event.target.value;
        this.state.wiki.setTitle(title);

        // update vscode state
        this.codeState.set('wiki', this.state.wiki);
        
        // send message to server
        this.props.message.send({
            type: 'updateTitle',
            title: title
        });
    }

    handleSubmit(snippet: Snippet) {
        if (!this.props.message) {
            return;
        }

        this.state.wiki.addSnippet(snippet);

        this.props.message.send({
            type: 'addSnippet',
            snippet: snippet
        });

        this.setState({ showModal: false });
    }

    close() {
        this.setState({ 
            showModal: false,
            selectedSnippet: undefined
        });
    }

    componentDidMount() {
        // create new Wiki instance from codeState
        if (this.codeState.get('wiki')) {
            let state = this.codeState.get('wiki');
            let wiki = new Wiki();

            // constructor would replace all of this
            wiki.setTitle(state.title);
            wiki.setSnippets(state.snippets);

            this.setState({ wiki: wiki });
        }

        if (this.props.message) {
            this.props.message.send({
                type: 'ready'
            });

            this.props.message.on('addSnippet', (message) => {
                console.log('maverick');

                let snippet = new Snippet(message.snippet.start, message.snippet.end, message.snippet.text);

                // show modal
                this.setState({
                    showModal: true,
                    selectedSnippet: snippet
                });
            });
        }
    }

    componentDidUpdate(oldProps: WebViewProps, oldState: WebViewState) {
        // update vscode state with react state
        this.props.vscode.setState(this.state);
    }

    render () {
        return (
            <div className="app-container">
                <input type="text" name="title" className="title-input" onChange={(e) => { this.changeTitle(e); }} defaultValue={this.state.wiki.title} placeholder="Wiki Title" />
                {this.state.wiki.snippets.length > 0 &&
                    <ul className="snippet-list">
                        {
                            this.state.wiki.snippets.map((snippet: Snippet, key: number) => {
                                return (
                                    <li className="snippet" key={key}>
                                        <svg width="14px" height="12px" viewBox="0 0 14 12" version="1.1" className="snippet-handle">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g transform="translate(-1183.000000, -453.000000)" fill="#464954">
                                                    <g transform="translate(1166.000000, 363.000000)">
                                                        <g transform="translate(17.000000, 90.000000)">
                                                            <rect x="0" y="0" width="14" height="2" rx="1"></rect>
                                                            <rect x="0" y="5" width="14" height="2" rx="1"></rect>
                                                            <rect x="0" y="10" width="14" height="2" rx="1"></rect>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg>
                                        {snippet.description && 
                                            <p className="snippet-description" dangerouslySetInnerHTML={{ __html: snippet.description.replace(/(?:\r\n|\r|\n)/g, '<br>') }}></p>
                                        }
                                        <pre className="snippet-code">{snippet.text}</pre>
                                    </li>
                                );
                            })
                        }
                    </ul>                
                }
                {this.state.showModal &&
                    <Modal snippet={this.state.selectedSnippet} handleSubmit={(snippet: Snippet) => { this.handleSubmit(snippet); }} close={() => { this.close(); }} />
                }
            </div>
        );
    }
}