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

    @property
    private vel: number = 2000;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    setPosition (x: number, y?: number) {
        this.node.setPosition(x, y);
    }

    setAngle (angle) {
        this.trail.node.angle = angle - 90;
        this.vy = 1;
        if (angle > 90) {
            angle -= 180;
            this.vy = -1;
        }
        let tan = Math.tan(angle * Math.PI/180);
        this.vy *= Math.sqrt(this.vel*this.vel/(tan*tan + 1));
        this.vx = -tan*this.vy;
    }

    start () {

    }

    updateFly (dt) {
        this.node.x += this.vx*dt;
        this.node.y += this.vy*dt;
    }
}
