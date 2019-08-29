export default class VSCodeState {
    private state: { [key: string]: any };
    private vscode: any;

    constructor(vscode: any) {
        this.vscode = vscode;
        this.state = vscode.getState() || {};
    }

    public get(key: string) {
        if(typeof this.state[key] !== undefined) {
            return this.state[key];
        }
    }

    public set(key: string, value: any) {
        this.state[key] = value;
        this.vscode.setState(this.state);
    }
}