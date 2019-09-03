import * as React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import Wiki from '../../models/Wiki';
import Snippet from '../../models/Snippet';
import MessageBus from '../messages';

import Modal from './Modal';
import SnippetComponent from './Snippet';

import VSCodeState from '../state';

interface WebViewProps {
    message?: MessageBus;
    vscode?: any;
}

interface WebViewState {
    wiki: Wiki;
    showModal: boolean;
    isSorting: boolean;
    selectedSnippet?: Snippet;
}

const SortableItem = SortableElement(({ value, canSelect }: { value: Snippet, canSelect: boolean }) => { return <SnippetComponent snippet={value} canSelect={canSelect} />; });

const SortableList = SortableContainer(({ items, canSelect }: { items: Snippet[], canSelect: boolean }) => {
    return (
        <div className="snippet-list">
            {
                items.map((value: Snippet, index: number) => (
                    <SortableItem key={`item-${value.description}`} index={index} value={value} canSelect={canSelect} />
                ))
            }
        </div>
    );
});

export default class App extends React.Component<WebViewProps, WebViewState> {
    private codeState: VSCodeState;

    constructor(props: WebViewProps) {
        super(props);

        this.codeState = new VSCodeState(this.props.vscode);

        this.state = {
            wiki: new Wiki(),
            showModal: false,
            isSorting: false
        };

        this.onSortEnd = this.onSortEnd.bind(this);
        this.onSortStart = this.onSortStart.bind(this);
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

    onSortStart() {
        this.setState({ isSorting: true });
    }

    onSortEnd({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) {
        let snippets = this.state.wiki.snippets;
        let newSnippets = arrayMove(snippets, oldIndex, newIndex);

        this.state.wiki.setSnippets(newSnippets);

        this.setState({ isSorting: false });

        this.forceUpdate();
    }

    componentDidMount() {
        // create new Wiki instance from VSCode's internal state
        if (this.codeState.get('wiki')) {
            let state = this.codeState.get('wiki');
            let wiki = new Wiki();

            // TODO: instantiate wiki with options object
            wiki.setTitle(state.title);
            wiki.setSnippets(state.snippets);

            this.setState({ wiki: wiki });
        }

        if (this.props.message) {
            this.props.message.send({
                type: 'ready'
            });

            this.props.message.on('addSnippet', (message) => {
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

        console.log('component updated!');
    }

    render () {
        return (
            <div className="app-container">
                <input type="text" name="title" className="title-input" onChange={(e) => { this.changeTitle(e); }} defaultValue={this.state.wiki.title} placeholder="Wiki Title" />
                {this.state.wiki.snippets.length > 0 &&
                    <SortableList items={this.state.wiki.snippets} onSortEnd={this.onSortEnd} onSortStart={this.onSortStart} canSelect={!this.state.isSorting} useDragHandle />
                }
                {this.state.showModal &&
                    <Modal snippet={this.state.selectedSnippet} handleSubmit={(snippet: Snippet) => { this.handleSubmit(snippet); }} close={() => { this.close(); }} />
                }
            </div>
        );
    }
}