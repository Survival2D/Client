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

    private vel: number = 2000;

    public damage: number = 10;

    public isHit: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    setPosition (x: number, y?: number) {
        this.node.setPosition(x, y);
    }

    setAngle (angle) {
        this.trail.node.angle = angle + 90;
        this.vy = Math.cos(angle * Math.PI/180) * this.vel;
        this.vx = -Math.tan(angle * Math.PI/180) * this.vy;
    }

    start () {

    }

    fire () {
        this.node.active = true;
        this.trail.node.active = true;
        this.isHit = false;
        this.trail.node.scaleX = 0;
        this.trail.node.stopAllActions();
        cc.tween(this.trail.node)
            .to(0.07, {scaleX: 1})
            .union()
            .start()
    }

    hit () {
        //TODO: anim hit
        this.isHit = true;
        this.trail.node.stopAllActions();
        cc.tween(this.trail.node)
            .to(0.05, {scaleX: 0})
            .call(() => {
                this.node.active = false;
                this.trail.node.active = false;
            })
            .union()
            .start()
    }

    isAvailable () {
        return !this.node.active;
    }

    updateFly (dt) {
        this.node.x += this.vx*dt;
        this.node.y += this.vy*dt;
    }
}
