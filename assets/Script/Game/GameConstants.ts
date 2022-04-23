export class PlayerColor {
    static body : cc.Color[] = [
        cc.color().fromHEX("#f8c574"),
        cc.color().fromHEX("#c40000"),
        cc.color().fromHEX("#bc002d"),
        cc.color().fromHEX("#1b400c"),
        cc.color().fromHEX("#990000"),
    ]
    static hand : cc.Color[] = [
        cc.color().fromHEX("#f8c574"),
        cc.color().fromHEX("#16b900"),
        cc.color().fromHEX("#FFFFFF"),
        cc.color().fromHEX("#b5c58b"),
        cc.color().fromHEX("#4c1111"),
    ]
    static back : cc.Color[] = [
        cc.color().fromHEX("#816537"),
        cc.color().fromHEX("#059300"),
        cc.color().fromHEX("#c0a73f"),
        cc.color().fromHEX("#ab7c29"),
        cc.color().fromHEX("#ffcc00"),
    ]
}

export class MapConfig {
    static numObs: number = 10;
    static obsPos = [
        {x: -100, y: 200},
        {x: -132, y: 1019},
        {x: 441, y: 15},
        {x: 607, y: -333},
        {x: 115, y: -231},
        {x: 19, y: 449},
        {x: 1004, y: -876},
        {x: -1407, y: 1113},
        {x: -999, y: 1},
        {x: -12, y: 1397}
    ]
    static width: number = 3600;
    static height: number = 3000;
    static mapScale: number = 1/10;
}

export class Config {
    public static IS_ONLINE = true;
}
