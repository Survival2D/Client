class RollbackVar<T> {

    private history: Map<number, T> = new Map<number, T>();

    public get(tick: number): T {
        return this.history.get(tick);
    }

    public set(tick: number, value: T) {
        this.history.set(tick, value);
    }

    public has(tick: number): boolean {
        return this.history.has
        (tick);
    }

    public getLastValue(tick: number): T {
        for (; tick >= 0; tick--)
            if (this.has(tick))
                return this.history[tick];

        return null;
    }

    public eraseFuture(tick: number) {
        this.history.forEach((value, key) => {
            if (key > tick) {
                this.history.delete(key);
            }
        });

    }
}
