// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {PlayerColor} from "./GameConstants";
import instantiate = cc.instantiate;
import GameScene from "./GameScene";
import Canvas = cc.Canvas;

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

    @property(cc.Sprite)
    gun: cc.Sprite = null;

    private bodyColor: cc.Color = PlayerColor.body[0];
    private handColor: cc.Color = PlayerColor.hand[0];
    private backColor: cc.Color = PlayerColor.back[0];

    private isEquip: boolean = false;

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

        this.gun.node.setPosition(0, 50);
    }

    start () {
        this.gun.node.active = false;
    }

    equipGun (idx: number) {
        this.isEquip = !this.isEquip;
        if (this.isEquip) {
            this.gun.node.active = true;
            this.leftHand.setPosition(-10, 50);
            this.rightHand.setPosition(10, 35);
        }
        else {
            this.unEquipGun();
        }
    }

    unEquipGun () {
        this.gun.node.active = false;
        this.leftHand.setPosition(-25, 25);
        this.rightHand.setPosition(25, 25);
    }

    fire () {
        if (this.isEquip) {
            let scene = cc.director.getScene();
            scene.getChildByName("Canvas").getComponent(GameScene).onFire(this.node.x, this.node.y, this.node.angle);
        }
        else this.hit();
    }

    hit () {

    }

    onDestroy () {
        // Cancel keyboard input monitoring
    }
}
