// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Obstacle from "./Obstacle/Obstacle";
import Player from "./Player";
import Bullet from "./MapObject/Bullet";
import {MatchManager} from "./Logic/MatchManager";
import {MapConfig} from "../Game/GameConstants";
import MiniMap from "./MiniMap";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MatchScene extends cc.Component {

    private isUp: boolean = false;
    private isDown: boolean = false;
    private isLeft: boolean = false;
    private isRight: boolean = false;

    @property
    vel: number = 200;

    @property(cc.Prefab)
    private bushPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    @property(cc.Node)
    map: cc.Node = null;

    @property(cc.Node)
    mapGrid: cc.Node = null;

    @property(cc.Node)
    camera: cc.Node = null;

    @property(cc.Layout)
    hud: cc.Layout = null;

    @property(cc.Node)
    miniMapNode: cc.Node = null;

    @property(cc.ProgressBar)
    myHpProgress: cc.ProgressBar = null;

    @property(cc.Node)
    mainPlayerNode: cc.Node = null;

    private mainPlayer: Player = null;

    private playersMap: Map<string, Player> = new Map<string, Player>();

    private bullets: Bullet[] = [];

    private obstacles : Obstacle[] = [];

    private miniMap: MiniMap = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.map.width = MapConfig.width;
        this.map.height = MapConfig.height;

        this.drawMapGrid();

        let ctx = this.hud.getComponent(cc.Graphics);
        ctx.rect(this.miniMapNode.x - this.miniMapNode.width/2, this.miniMapNode.y - this.miniMapNode.height/2, this.miniMapNode.width, this.miniMapNode.height);
        ctx.stroke();

        this.mainPlayer = this.mainPlayerNode.getComponent(Player);

        this.genObstacles();

        this.miniMap = this.miniMapNode.getComponent(MiniMap);
        this.miniMap.init(this.bushPrefab);
    }

    start () {
        MatchManager.getInstance().setScene(this);

        let playerPosInValid = false, randX, randY;
        do {
            playerPosInValid = false;
            randX = (Math.random() - 0.5) * this.map.width;
            randY = (Math.random() - 0.5) * this.map.height;
            for (let obs of this.obstacles) {
                if (obs.checkCollisionCircle(28, randX, randY)) playerPosInValid = true;
            }
        } while (playerPosInValid)

        MatchManager.getInstance().updateMainPlayerPos(randX, randY, 0);
        // this.mainPlayerNode.setPosition(randX, randY);

        MatchManager.getInstance().sendUpdatePlayerPos(this.mainPlayerNode.x, this.mainPlayerNode.y, this.mainPlayerNode.angle);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.camera.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.camera.on(cc.Node.EventType.MOUSE_DOWN, this.onClick, this);
        this.camera.on(cc.Node.EventType.MOUSE_WHEEL, this.onScroll, this);
    }

    onKeyDown (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.isLeft = true;
                break;
            case cc.macro.KEY.s:
                this.isDown = true;
                break;
            case cc.macro.KEY.d:
                this.isRight = true;
                break;
            case cc.macro.KEY.w:
                this.isUp = true;
                break;
            case cc.macro.KEY.f:
                this.toggleMainPlayerEquip();
                MatchManager.getInstance().sendPlayerEquip(this.mainPlayer.isEquip);
                break;
            case cc.macro.KEY.t:
                MatchManager.getInstance().createNewPlayer("123");
        }
    }

    onKeyUp (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.isLeft = false;
                break;
            case cc.macro.KEY.s:
                this.isDown = false;
                break;
            case cc.macro.KEY.d:
                this.isRight = false;
                break;
            case cc.macro.KEY.w:
                this.isUp = false;
                break;
        }
    }

    onMouseMove (event) {
        let dx = event.getLocationX() - this.camera.width/2;
        let dy = event.getLocationY() - this.camera.height/2;
        let angle = Math.atan(-dx/dy) * 180 / Math.PI;
        if (dy < 0) angle = 180 + angle;
        this.mainPlayerNode.angle = angle;
    }

    onClick (event) {
        switch (event.getButton()) {
            case cc.Event.EventMouse.BUTTON_LEFT:
                this.mainPlayer.fire();
                break;
        }
    }

    onScroll (event) {
        if (event.getScrollY() > 0) {
            this.zoomIn();
        }
        else {
            this.zoomOut();
        }
    }

    zoomOut () {
        if (this.map.scale < 1/8) return;
        this.map.scale /= 2;
    }

    zoomIn () {
        if (this.map.scale >= 1) return;
        this.map.scale *= 2;
    }

    drawMapGrid () {
        this.mapGrid.zIndex = -2;
        let ctx = this.mapGrid.getComponent(cc.Graphics);
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
            this.map.addChild(node);
            this.obstacles.push(node.getComponent(Obstacle));

            node.setPosition(MapConfig.obsPos[i].x, MapConfig.obsPos[i].y);
        }
    }

    getBullet () {
        for (let bullet of this.bullets) {
            if (bullet.isAvailable()) return bullet;
        }

        let node = cc.instantiate(this.bulletPrefab);
        this.map.addChild(node, -1);
        let bullet = node.getComponent(Bullet);
        this.bullets.push(bullet);

        return bullet;
    }

    newPlayerJoin (id: string) {
        if (this.playersMap.has(id)) return;
        cc.log("Create new player, id:", id);
        let player = cc.instantiate(this.playerPrefab);
        this.map.addChild(player);
        this.playersMap.set(id, player.getComponent(Player));
    }

    updateMyPlayerPos (x: number, y: number) {
        this.mainPlayerNode.setPosition(x, y);

        this.miniMap.updateMyPlayerPos(x, y);
    }

    updatePlayerPos (id: string, x: number, y: number, angle: number) {
        if (!this.playersMap.has(id)) {
            MatchManager.getInstance().createNewPlayer(id);
        }
        this.playersMap.get(id).node.setPosition(x, y);
        this.playersMap.get(id).node.angle = angle;
    }

    onFire (x: number, y: number, angle: number) {
        let bullet = this.getBullet();
        bullet.setPosition(x, y);
        bullet.setAngle(angle);
        bullet.fire();
    }

    toggleMainPlayerEquip () {
        this.mainPlayer.toggleEquipGun();
    }

    onPlayerEquip (id: string, isEquip: boolean) {
        if (!this.playersMap.has(id)) {
            MatchManager.getInstance().createNewPlayer(id);
        }
        this.playersMap.get(id).setEquipGun(isEquip);
    }

    onMainPlayerDied () {
        //TODO: anim main player died, end match
        this.mainPlayer.died();
    }

    onDied (id: string) {
        if (!this.playersMap.has(id)) return;
        this.playersMap.get(id).died();
        this.playersMap.delete(id);
    }

    update (dt) {
        this.moveMainPlayer(dt);

        // bullets "fly"
        this.bullets.forEach(e => {
            if (!e.isHit) {
                e.updateFly(dt);
                this.checkHitPlayer(e);
                this.checkHitObstacle(e);
            }
        });
    }

    moveMainPlayer (dt) {
        let newX = this.mainPlayerNode.x, newY = this.mainPlayerNode.y;
        if (this.isLeft && this.isUp) {
            newX -= this.vel/1.4 * dt;
            newY += this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isDown) {
            newX -= this.vel/1.4 * dt;
            newY -= this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isUp) {
            newX += this.vel/1.4 * dt;
            newY += this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isDown) {
            newX += this.vel/1.4 * dt;
            newY -= this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isRight) {}
        else if (this.isUp && this.isDown) {}
        else if (this.isLeft) newX -= this.vel * dt;
        else if (this.isRight) newX += this.vel * dt;
        else if (this.isUp) newY += this.vel * dt;
        else if (this.isDown) newY -= this.vel * dt;

        for (let obs of this.obstacles) {
            if (obs.checkCollisionCircle(28, newX, newY)) {
                if (!obs.checkCollisionCircle(28, this.mainPlayerNode.x, newY)) {
                    newX = this.mainPlayerNode.x;
                }
                else if (!obs.checkCollisionCircle(28, newX, this.mainPlayerNode.y)) {
                    newY = this.mainPlayerNode.y;
                }
                else {
                    return;
                }
            }
        }

        MatchManager.getInstance().sendUpdatePlayerPos(newX, newY, this.mainPlayerNode.angle);
        MatchManager.getInstance().updateMainPlayerPos(newX, newY, this.mainPlayerNode.angle);

        // move camera following player
        this.camera.x = this.mainPlayerNode.x;
        this.camera.y = this.mainPlayerNode.y;
        this.hud.node.x = this.mainPlayerNode.x;
        this.hud.node.y = this.mainPlayerNode.y;
    }

    checkHitPlayer (bullet: Bullet): boolean {
        if (this.mainPlayer.checkCollisionPoint(bullet.node.x, bullet.node.y)) {
            this.mainPlayer.hit(bullet.damage);
            this.myHpProgress.progress = this.mainPlayer.getHpRatio();
            bullet.hit();
            return true;
        }
        this.playersMap.forEach(e => {
            if (e.checkCollisionPoint(bullet.node.x, bullet.node.y)) {
                e.hit(bullet.damage);
                bullet.hit();
                return true;
            }
        })
        return false;
    }

    checkHitObstacle (bullet: Bullet): boolean {
        this.obstacles.forEach(e => {
            if (e.checkCollisionPoint(bullet.node.x, bullet.node.y)) {
                e.hit();
                bullet.hit();
                return true;
            }
        })
        return false;
    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.camera.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.camera.off(cc.Node.EventType.MOUSE_DOWN, this.onClick, this);
        this.camera.off(cc.Node.EventType.MOUSE_WHEEL, this.onScroll, this);
    }
}
