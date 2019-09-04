import { ModelInterface } from "../interfaces/ModelInterface";

export default class Model implements ModelInterface {
    public id: string = ''; // children will need a way of creating unique id

    toJson() {
        return JSON.stringify(this);
    }

    save() {
        // write to teams.json file using this.key
    }
}