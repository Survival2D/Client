import {PlayerData} from "./PlayerData";

export class PlayerLogic {
    private data: PlayerData;
    private x: number;
    private y: number;
    private angle: number;
    private isEquip: boolean;

    constructor(id?: string) {
        if (id === undefined) this.data = new PlayerData();
        this.data = new PlayerData(id);
    }

    getId () {
        return this.data.id;
    }

    setPosition (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setRotation (angle: number) {
        this.angle = angle;
    }

    setEquip (bool: boolean) {
        this.isEquip = bool;
    }
}