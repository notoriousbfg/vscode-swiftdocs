import * as React from 'react';
import { SortableHandle } from 'react-sortable-hoc';

import {default as SnippetModel} from '../models/Snippet';

import MessageBus from '../messages';

interface SnippetProps {
    snippet: SnippetModel;
    canSelect: boolean;
    message: MessageBus;
}

interface SnippetState {}

const DragHandle = SortableHandle(() => {
    return (
        <svg width="14px" height="12px" viewBox="0 0 14 12" version="1.1" className="snippet-handle">
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
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
    );
});

export default class Snippet extends React.Component<SnippetProps, SnippetState> {
    goToSnippet() {
        this.props.message.send({
            type: 'goToFile',
            snippet: this.props.snippet
        });
    }

    render() {
        return (
            <div className={`snippet ${!this.props.canSelect ? 'no-select' : ''}`}>
                <DragHandle />
                {this.props.snippet.description !== undefined &&
                    <p className="snippet-description" dangerouslySetInnerHTML={{ __html: this.props.snippet.description!.replace(/(?:\r\n|\r|\n)/g, '<br>') }}></p>
                }
                <pre className="snippet-code" onClick={(e) => { this.goToSnippet(); }}>{this.props.snippet.text}</pre>
            </div>
        );
    }
}