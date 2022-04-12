import {MapConfig} from "./Logic/GameConstants";
import Obstacle from "./Obstacle/Obstacle";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MiniMap extends cc.Component {
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Node)
    grid: cc.Node = null;

    private bushPrefab: cc.Prefab;
    private playerPrefab: cc.Prefab;

    private obstacles : Obstacle[] = [];

    private mainPlayer: Player;

    onLoad () {
        this.bg.node.width = MapConfig.width;
        this.bg.node.height = MapConfig.height;
        this.bg.node.scale = MapConfig.mapScale;
    }

    init (bushPrefab, playerPrefab) {
        this.drawMapGrid();

        this.bushPrefab = bushPrefab;
        this.playerPrefab = playerPrefab;

        let node = cc.instantiate(this.playerPrefab);
        this.node.addChild(node);
        node.scale = MapConfig.mapScale;
        this.mainPlayer = node.getComponent(Player);

        this.genObstacles();
    }

    drawMapGrid () {
        let ctx = this.grid.getComponent(cc.Graphics);
        ctx.lineWidth /= MapConfig.mapScale;
        let start = -MapConfig.width/2;
        while (start < MapConfig.width/2) {
            start += 250;
            ctx.moveTo(start, -MapConfig.height/2);
            ctx.lineTo(start, MapConfig.height/2);
            ctx.stroke();
        }
        start = -MapConfig.height/2;
        while (start < MapConfig.height/2) {
            start += 250;
            ctx.moveTo(-MapConfig.width/2, start);
            ctx.lineTo(MapConfig.width/2, start);
            ctx.stroke();
        }
    }

    genObstacles () {
        for (let i = 0; i < MapConfig.numObs; i++) {
            let node = cc.instantiate(this.bushPrefab);
            this.bg.node.addChild(node);
            this.obstacles.push(node.getComponent(Obstacle));
            node.setPosition(MapConfig.obsPos[i].x, MapConfig.obsPos[i].y);
        }
    }

    updateMyPlayerPos (x: number, y: number) {
        this.bg.node.x = -x*MapConfig.mapScale;
        this.bg.node.y = -y*MapConfig.mapScale;
    }

    start () {

    }

    onDestroy () {

    }
}