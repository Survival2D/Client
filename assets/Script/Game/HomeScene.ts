import {MatchManager} from "../Match/Logic/MatchManager";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import {Config} from "./GameConstants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeScene extends cc.Component {
  @property(cc.Button)
  buttonPlayNow: cc.Button = null;
  @property(cc.Sprite)
  avatar: cc.Sprite = null;
  @property(cc.Label)
  playerName: cc.Label = null;
  @property(cc.Label)
  playerLevel: cc.Label = null;

  start() {
    // init logic
    this.buttonPlayNow.node.on("click", this.onPlayNow, this);

    this.playerName.string = "Tien No Mo Non";
    this.playerLevel.string = "10";

    // cc.resources.load(
    //   "avatar",
    //   cc.Texture2D,
    //   (err: any, texture: cc.Texture2D) => {
    //     let spriteFrame = new cc.SpriteFrame();
    //     spriteFrame.setTexture(texture);
    //     this.avatar.spriteFrame = spriteFrame;
    //   }
    // );
  }

  async onPlayNow() {
    if (Config.IS_ONLINE) await MultiplayerManager.instance.joinMatchAsync();
    else {
      MatchManager.getInstance().newMatch();
    }
  }
}
