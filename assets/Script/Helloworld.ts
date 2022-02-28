const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Button)
    buttonPlayNow: cc.Button = null;
    @property(cc.Sprite)
    avatar: cc.Sprite = null;
    @property(cc.Label)
    playerName: cc.Label = null;
    @property(cc.Label)
    playerLevel: cc.Label = null;

    start () {
        // init logic
        this.buttonPlayNow.node.on('click', this.onPlayNow, this);

        this.playerName.string = "Tien No Mo Non";
        this.playerLevel.string = "10";

        let texture = new cc.Texture2D();
        texture.url = "assets/Texture/avatar.png";
        this.avatar.spriteFrame.setTexture(texture);
    }

    onPlayNow () {
        cc.log("DMM playnow here")
    }
}
