export default class Property {
    constructor(setup, settings = {}) {
        console.log('Initializing Property with setup:', setup)
        this.id = setup.id
        this.type = setup.type
        this.label = setup.label
        this.default = setup.default
    }

    export() {

    }
}
