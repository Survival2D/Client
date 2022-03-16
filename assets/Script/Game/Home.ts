import director = cc.director;

const {ccclass, property} = cc._decorator;

@ccclass
export default class Home extends cc.Component {

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

        cc.resources.load("avatar", cc.Texture2D ,(err: any, texture: cc.Texture2D) => {
            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);
            this.avatar.spriteFrame = spriteFrame;
        });
    }

    onPlayNow () {
        director.loadScene("GameScene");
    }
}