// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {MapConfig} from "../../Game/GameConstants";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LootItem extends cc.Component {

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Sprite)
    item: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.resources.load('loot/loot-circle-outer-01', cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            this.bg.spriteFrame = spriteFrame;
        });
    }

    setItemId (id: number) {
        let path = "";
        switch (id) {
            case MapConfig.lootItemId.gun:
                path = "loot/loot-weapon-ak";
                break;
            case MapConfig.lootItemId.ammo:
                path = "loot/loot-weapon-ak";
                break;
            case MapConfig.lootItemId.chest:
                path = "loot/loot-chest-01";
                break;
            case MapConfig.lootItemId.helmet:
                path = "loot/loot-helmet-01";
                break;
        }
        cc.resources.load(path, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            this.item.spriteFrame = spriteFrame;
        });
    }

    // update (dt) {}
}
