// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

    @property(cc.Sprite)
    trail: cc.Sprite = null;

    private vx: number = null;
    private vy: number = null;

    private vel: number = 100;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    setPosition (x: number, y?: number) {
        this.node.setPosition(x, y);
        this.node.active = true;
        this.trail.node.active = true;
    }

    setAngle (angle) {
        this.trail.node.angle = angle + 90;
        this.vy = Math.cos(angle * Math.PI/180) * this.vel;
        this.vx = -Math.tan(angle * Math.PI/180) * this.vy;
    }

    start () {

    }

    hit () {
        //TODO: anim hit
        this.node.active = false;
        this.trail.node.active = false;
    }

    isAvailable () {
        return !this.node.active;
    }

    updateFly (dt) {
        this.node.x += this.vx*dt;
        this.node.y += this.vy*dt;
    }
}
