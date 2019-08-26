export default class MessageBus {
    private vscode: any;

    public constructor(vscode: any) {
        this.vscode = vscode;
        window.addEventListener('message', this.handleMessage);
    }

    // what event type is this?
    private handleMessage(evt: any) {
        console.log(evt);

        switch(evt.type) {
            case 'addSnippet':
                console.log(evt.snippet);
                break;
            default:
                break;
        }
    }

    public send(message: {}) {
        this.vscode.postMessage(message);
    }

    public destroy() {
        window.removeEventListener('message', this.handleMessage);
    }
}