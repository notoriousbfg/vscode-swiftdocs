import * as React from 'react';

import Snippet from '../models/Snippet';

interface ModalProps {
    snippet: Snippet | undefined;
    handleSubmit: Function;
    close: Function;
}

interface ModalState {
    modalActive: boolean;
    description: string;
}

export default class Modal extends React.Component<ModalProps, ModalState> {
    constructor(props: ModalProps) {
        super(props);
        this.state = {
            modalActive: false,
            description: ''
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ modalActive: true });
        }, 250);
    }

    updateDescription(event: React.ChangeEvent<HTMLTextAreaElement>) {
        this.setState({ description: event.currentTarget.value });
    }

    handleSubmitClick(event: React.MouseEvent) {
        let snippet = this.props.snippet;

        if(snippet !== undefined) {
            snippet.description = this.state.description;
            this.props.handleSubmit(snippet);
        }
    }

    close() {
        this.props.close();
    }

    render() {
        return (
            <div className={'overlay ' + (this.state.modalActive ? 'active' : null)}>
                <div className="modal" ref="modal">
                    <h2 className="modal-title">How does this code work?</h2>
                    <textarea className="textarea modal-snippet-text" name="snippet">{this.props.snippet !== undefined ? this.props.snippet.text : null}</textarea>
                    <textarea className="textarea modal-snippet-description" name="snippet_descripion" onChange={(e) => { this.updateDescription(e); }} placeholder="Your explanation"></textarea>
                    <div className="modal-footer">
                        <span className="button cancel-button" onClick={(e) => { this.close(); }}>Cancel</span>
                        <span className="button submit-button" onClick={(e) => { this.handleSubmitClick(e); }}>Submit</span>
                    </div>
                </div>
            </div>
        );
    }
}