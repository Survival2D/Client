import {MapConfig, PlayerColor} from "../Game/GameConstants";
import Obstacle from "./MapObject/Obstacle/Obstacle";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MiniMap extends cc.Component {
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Node)
    grid: cc.Node = null;

    @property(cc.Node)
    mainPlayer: cc.Node = null;

    private bushPrefab: cc.Prefab;

    private playerColor: cc.Color = PlayerColor.body[0];

    private obstacles : Obstacle[] = [];

    onLoad () {
        this.bg.node.width = MapConfig.width;
        this.bg.node.height = MapConfig.height;
        this.bg.node.scale = MapConfig.mapScale;
    }

    init (bushPrefab) {
        this.drawMapGrid();

        this.bushPrefab = bushPrefab;

        this.genObstacles();

        let ctx = this.mainPlayer.getComponent(cc.Graphics);
        ctx.fillColor = this.playerColor;
        ctx.strokeColor = this.playerColor;
        ctx.circle(0, 0, 28);
        ctx.fill();
        ctx.stroke();
        this.mainPlayer.scale = MapConfig.mapScale * 2;
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