export default class MessageBus {
    private vscode: any;
    private listeners: { [key: string]: Function };

    public constructor(vscode: Object) {
        this.vscode = vscode;
        this.listeners = {};

        this.handleMessage = this.handleMessage.bind(this);
        window.addEventListener('message', this.handleMessage);
    }

    // fired when message is received
    private handleMessage(event: any) : void {
        let message = event.data;

        if(typeof this.listeners[message.type] !== undefined) {
            this.listeners[message.type](message);
        }
    }

    public on(type: string, callback: (message: { [key: string]: any }) => any) {
        this.listeners[type] = callback;
    }

    public send(message: {}) {
        this.vscode.postMessage(message);
    }

    public destroy() {
        window.removeEventListener('message', this.handleMessage);
    }
}