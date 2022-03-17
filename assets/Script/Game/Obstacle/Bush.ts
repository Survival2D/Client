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

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
