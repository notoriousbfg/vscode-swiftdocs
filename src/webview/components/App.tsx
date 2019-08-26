import * as React from 'react';

import Snippet from '../../models/Snippet';
import MessageBus from '../messages';

interface WebViewProps {
    message: MessageBus;
    vscode: any; // ?
}

interface WebViewState {
    title: string;
    snippets: Snippet[];
}

export default class App extends React.Component<WebViewProps, WebViewState> {
    constructor(props: WebViewProps) {
        super(props);
        // this should be a Wiki
        this.state = this.props.vscode.getState() || {
            title: '',
            snippets: []
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

    componentDidUpdate(oldProps: WebViewProps, oldState: WebViewState) {
        // update vscode state with react state
        this.props.vscode.setState(this.state);
    }

    componentDidMount() {
        this.props.message.on('addSnippet', (message) => {
            // push snippet into state
        });
    }

    render () {
        return (
            <div>
                <input type="text" name="title" className="title-input" onChange={(e) => { this.changeTitle(e); }} defaultValue={this.state.title} />
                {this.state.snippets.length > 0 &&
                    <ul className="snippet-list">
                        {
                            this.state.snippets.map((snippet, key) => {
                                return (
                                    <li key={key}>
                                        <pre>{snippet.text}</pre>
                                    </li>
                                );
                            })
                        }
                    </ul>                
                }
            </div>
        );
    }
}