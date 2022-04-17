export class UserInfo {
    public readonly userId: string;
    public readonly userName: string;
    public level: number;

    constructor(id?: string) {
        if (id === undefined) this.userId = "0";
        else this.userId = id;
    }
}
