// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Obstacle from "./Obstacle/Obstacle";
import Prefab = cc.Prefab;
import instantiate = cc.instantiate;

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

    @property(cc.Node)
    camera: cc.Node = null;

    @property(cc.Node)
    mainPlayer: cc.Node = null;

    private obstacles : Obstacle[];
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.obstacles = [];
        this.genObstacles(3);
    }

    start () {
        cc.log("number of obstacles", this.obstacles.length);
        for (let obs of this.obstacles) {
            obs.setPosition((Math.random()-0.5)*900, (Math.random()-0.5)*700);
        }

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.camera.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
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
        this.mainPlayer.angle = angle;
    }

    genObstacles (num?: number) {
        for (let i = 0; i < num; i++) {
            let node = instantiate(this.bushPrefab);
            this.node.addChild(node);
            this.obstacles.push(node.getComponent(Obstacle));
        }
    }

    update (dt) {
        if (this.isLeft && this.isUp) {
            this.mainPlayer.x -= this.vel/1.4 * dt;
            this.mainPlayer.y += this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isDown) {
            this.mainPlayer.x -= this.vel/1.4 * dt;
            this.mainPlayer.y -= this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isUp) {
            this.mainPlayer.x += this.vel/1.4 * dt;
            this.mainPlayer.y += this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isDown) {
            this.mainPlayer.x += this.vel/1.4 * dt;
            this.mainPlayer.y -= this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isRight) {}
        else if (this.isUp && this.isDown) {}
        else if (this.isLeft) this.mainPlayer.x -= this.vel * dt;
        else if (this.isRight) this.mainPlayer.x += this.vel * dt;
        else if (this.isUp) this.mainPlayer.y += this.vel * dt;
        else if (this.isDown) this.mainPlayer.y -= this.vel * dt;

        // move camera following player
        this.camera.x = this.mainPlayer.x;
        this.camera.y = this.mainPlayer.y;
    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.camera.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}
