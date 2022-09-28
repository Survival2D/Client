/**
 * Created by quantm7 on 9/11/2022.
 */

const PlayerUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.initPlayerUI();
    },

    initPlayerUI: function () {
        let drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 30, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 30, 0, 10000, false, 3, cc.color("#000000"));
        this.addChild(drawNode);
        this._body = drawNode;

        drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 10, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 10, 0, 10000, false, 3, cc.color("#000000"));
        this._body.addChild(drawNode);
        drawNode.setPosition(-20, 25);
        this._leftArm = drawNode;

        drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 10, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 10, 0, 10000, false, 3, cc.color("#000000"));
        this._body.addChild(drawNode);
        drawNode.setPosition(20, 25);
        this._rightArm = drawNode;


        let lbl = new ccui.Text("Name");
        lbl.setFontSize(22);
        this.addChild(lbl);
        lbl.setPosition(0, 45);
        this._name = lbl;

        let gun = new PlayerGunUI();
        this._body.addChild(gun);
        gun.setPosition(0, 20);
        this._gun = gun;
    },

    setPlayerUIInfo: function (name) {
        this._name.setString(name);
    },

    setMyPlayer: function (isMyPlayer = true) {
        if (isMyPlayer) {

        }
        else {

        }
    },

    setPlayerRotation: function (deg) {
        this._body.setRotation(deg);
    },

    equipGun: function (id) {
        this._gun.changeGun(id);
        this._gun.setVisible(true);
    }
});

const PlayerGunUI = ccui.ImageView.extend({
    ctor: function (id) {
        this._id = null;
        this._super();
        this.changeGun(id);
    },

    changeGun: function (id) {
        if (id === this._id) return;
        this._id = id || 0;
        this.loadTexture("res/Game/Player/gun_1.png");
    }
})