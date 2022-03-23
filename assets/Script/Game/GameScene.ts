// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Obstacle from "./Obstacle/Obstacle";
import Prefab = cc.Prefab;
import instantiate = cc.instantiate;
import Player from "./Player";
import Bullet from "./MapObject/Bullet";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    private isUp: boolean = false;
    private isDown: boolean = false;
    private isLeft: boolean = false;
    private isRight: boolean = false;

    @property
    vel: number = 200;

    @property(Prefab)
    private bushPrefab: Prefab = null;

    @property(Prefab)
    private playerPrefab: Prefab = null;

    @property(Prefab)
    bulletPrefab: Prefab = null;

    @property(cc.Node)
    camera: cc.Node = null;

    @property(cc.Node)
    mainPlayerNode: cc.Node = null;

    private mainPlayer: Player = null;

    private playersMap: Map<number, Player> = new Map<number, Player>();

    private bullets: Bullet[] = [];

    private obstacles : Obstacle[] = [];
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.genObstacles(7);
        this.mainPlayer = this.mainPlayerNode.getComponent(Player);
    }

    start () {
        for (let obs of this.obstacles) {
            obs.setPosition((Math.random()-0.5)*900, (Math.random()-0.5)*700);
        }

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.camera.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.camera.on(cc.Node.EventType.MOUSE_DOWN, this.onClick, this);
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
                this.mainPlayer.equipGun(1);
                break;
            case cc.macro.KEY.t:
                this.newPlayerJoin(123);
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

    genObstacles (num?: number) {
        for (let i = 0; i < num; i++) {
            let node = instantiate(this.bushPrefab);
            this.node.addChild(node);
            this.obstacles.push(node.getComponent(Obstacle));
        }
    }

    newPlayerJoin (id: number) {
        if (this.playersMap.has(id)) return;
        let player = instantiate(this.playerPrefab);
        this.node.addChild(player);
        this.playersMap.set(id, player.getComponent(Player));
    }

    updatePlayerPos (id:number, x: number, y?: number) {
        if (!this.playersMap.has(id)) return;
        this.playersMap.get(id).node.setPosition(x, y);
    }

    onFire (x: number, y: number, angle: number) {
        let node = instantiate(this.bulletPrefab);
        this.node.addChild(node);
        let bullet = node.getComponent(Bullet);
        this.bullets.push(bullet);
        bullet.setPosition(x, y);
        bullet.setAngle(angle);
    }

    update (dt) {
        this.moveMainPlayer(dt);

        // bullets "fly"
        this.bullets.forEach(e => e.updateFly(dt));
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

        for (let e of this.obstacles) {
            if (e.checkCollision(28, newX, newY)) {
                if (!e.checkCollision(28, this.mainPlayerNode.x, newY)) {
                    newX = this.mainPlayerNode.x;
                }
                else if (!e.checkCollision(28, newX, this.mainPlayerNode.y)) {
                    newY = this.mainPlayerNode.y;
                }
                else {
                    return;
                }
            }
        }

        this.mainPlayerNode.x = newX;
        this.mainPlayerNode.y = newY;

        // move camera following player
        this.camera.x = this.mainPlayerNode.x;
        this.camera.y = this.mainPlayerNode.y;
    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.camera.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.camera.off(cc.Node.EventType.MOUSE_DOWN, this.onClick, this);
    }
}
