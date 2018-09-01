export default class View {
    constructor(data, index) {
        this.index = index;
        this.name = data.name;
        this.path = data.path;
        this.data = data.data || null;
        this.params = data.params || null;
    }

    get label() {
        return `${this.name} (${this.path})`;
    }

    hasData() {
        return this.data !== null;
    }

    hasParams() {
        return this.params !== null;
    }
}
