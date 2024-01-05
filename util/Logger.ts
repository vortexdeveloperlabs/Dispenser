// TODO: This will extend console.log with color logging and and channel logging for the host server
export default class {
    constructor() {}
    action() {
        return console.info(...arguments);
    }
    error() {
        return console.log(...arguments);
    }
}
