// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Obstacle from "./Obstacle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bush extends Obstacle {

    @property(cc.Sprite)
    root: cc.Sprite = null;

    @property(cc.Sprite)
    leaf: cc.Sprite = null;

    onLoad () {
        this.r = this.root.node.width/2;
    }

    start () {

    }

    checkCollisionCircle (r: number, x:number, y?: number): boolean {
        let d2 = (this.node.x - x)*(this.node.x - x) + (this.node.y - y)*(this.node.y - y);
        return d2 <= r*r + this.r*this.r + 2*r*this.r;
    }

    checkCollisionPoint (x:number, y?: number): boolean {
        let d2 = (this.node.x - x)*(this.node.x - x) + (this.node.y - y)*(this.node.y - y);
        return d2 <= this.r*this.r;
    }

    // update (dt) {}
}
