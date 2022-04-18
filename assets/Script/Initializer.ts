// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SceneChanger from "./General/SceneChanger";
import NakamaManager from "./Nakama/NakamaManager";
import MultiplayerManager from "./Nakama/MultiplayerManager";
import GameManager from "./Game/GameManager";
import NakamaAutoLogin from "./Nakama/NakamaAutoLogin";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Initializer extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        SceneChanger.init();
        NakamaManager.init();
        MultiplayerManager.init();
        GameManager.init();
        NakamaAutoLogin.init();

        //preload resources
        cc.resources.preloadDir('loot', cc.SpriteFrame);
    }

    // update (dt) {}
}
