// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    isUp: boolean = false;
    isDown: boolean = false;
    isLeft: boolean = false;
    isRight: boolean = false;


    @property
    vel: number = 200;

    @property(cc.Node)
    body: cc.Node = null;

    @property(cc.Node)
    leftHand: cc.Node = null;

    @property(cc.Node)
    rightHand: cc.Node = null;

    @property(cc.Node)
    camera: cc.Node = null;

    @property(cc.Canvas)
    canvas: cc.Canvas = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let ctx = this.body.getComponent(cc.Graphics);
        ctx.fillColor = cc.color(200, 200, 200);
        ctx.circle(0, 0, 30);
        ctx.fill();
        ctx.stroke();

        ctx = this.leftHand.getComponent(cc.Graphics);
        ctx.fillColor = cc.color(200, 200, 200);
        ctx.circle(0, 0, 10);
        ctx.fill();
        ctx.stroke();

        ctx = this.rightHand.getComponent(cc.Graphics);
        ctx.fillColor = cc.color(200, 200, 200);
        ctx.circle(0, 0, 10);
        ctx.fill();
        ctx.stroke();

        this.body.setPosition(0, 0);
        this.leftHand.setPosition(-25, 25);
        this.rightHand.setPosition(25, 25);
    }

    start () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.canvas.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
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
        let dx = event.getLocationX() - this.node.x;
        let dy = event.getLocationY() - this.node.y;
        let angle = Math.atan(-dx/dy) * 180 / Math.PI;
        if (dy < 0) angle = 180 - angle;
        this.node.angle = angle;

        cc.log("dx:", event.getLocationX());
        cc.log("dy:", event.getLocationX());
        cc.log("Angle:", angle);
    }

    update (dt) {
        if (this.isLeft && this.isUp) {
            this.node.x -= this.vel/1.4 * dt;
            this.node.y += this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isDown) {
            this.node.x -= this.vel/1.4 * dt;
            this.node.y -= this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isUp) {
            this.node.x += this.vel/1.4 * dt;
            this.node.y += this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isDown) {
            this.node.x += this.vel/1.4 * dt;
            this.node.y -= this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isRight) {}
        else if (this.isUp && this.isDown) {}
        else if (this.isLeft) this.node.x -= this.vel * dt;
        else if (this.isRight) this.node.x += this.vel * dt;
        else if (this.isUp) this.node.y += this.vel * dt;
        else if (this.isDown) this.node.y -= this.vel * dt;

        // move camera following player
        this.camera.x = this.node.x;
        this.camera.y = this.node.y;
    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
}