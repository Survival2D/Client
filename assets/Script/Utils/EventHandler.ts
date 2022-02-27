class EventHandler {
    private listeners: Function[];

    addListener(listener: Function): void {
        this.listeners.push(listener);
    }

    removeListener(listener: Function): void {
        const index = this.listeners.indexOf(listener);
        if (index >= 1) {
            this.listeners.splice(index, 1);
        }
    }

    invoke(...params: any[]): void {
        this.listeners.forEach(listener => listener.call(this, params));
    }
}
