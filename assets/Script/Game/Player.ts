// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {PlayerColor} from "./GameConstants";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Node)
    body: cc.Node = null;

    @property(cc.Node)
    leftHand: cc.Node = null;

    @property(cc.Node)
    rightHand: cc.Node = null;

    @property(cc.Node)
    backPack: cc.Node = null;

    private bodyColor: cc.Color = PlayerColor.body[1];
    private handColor: cc.Color = PlayerColor.hand[1];
    private backColor: cc.Color = PlayerColor.back[1];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.genPlayer();
    }

    genPlayer () {
        let ctx = this.body.getComponent(cc.Graphics);
        ctx.fillColor = this.bodyColor;
        ctx.circle(0, 0, 28);
        ctx.fill();
        ctx.stroke();

        ctx = this.leftHand.getComponent(cc.Graphics);
        ctx.fillColor = this.handColor;
        ctx.circle(0, 0, 10);
        ctx.fill();
        ctx.stroke();

        ctx = this.rightHand.getComponent(cc.Graphics);
        ctx.fillColor = this.handColor;
        ctx.circle(0, 0, 10);
        ctx.fill();
        ctx.stroke();

        ctx = this.backPack.getComponent(cc.Graphics);
        ctx.fillColor = this.backColor;
        ctx.circle(0, 0, 27);
        ctx.fill();
        ctx.stroke();

        this.body.setPosition(0, 0);
        this.leftHand.setPosition(-25, 25);
        this.rightHand.setPosition(25, 25);
        this.backPack.setPosition(0, -10);
    }

    start () {

    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
}
