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
        drawNode.drawCircle(cc.p(0, 0), 30, 0, 10000, false, 2, cc.color("#000000"));
        this.addChild(drawNode);
        this._body = drawNode;

        drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 10, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 10, 0, 10000, false, 2, cc.color("#000000"));
        this._body.addChild(drawNode);
        drawNode.setPosition(25, 20);
        this._leftArm = drawNode;
        this._leftArm.defaultPosition = this._leftArm.getPosition();

        drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 10, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 10, 0, 10000, false, 2, cc.color("#000000"));
        this._body.addChild(drawNode);
        drawNode.setPosition(25, -20);
        this._rightArm = drawNode;
        this._rightArm.defaultPosition = this._rightArm.getPosition();


        let lbl = new ccui.Text("Name");
        lbl.setFontSize(22);
        this.addChild(lbl);
        lbl.setPosition(0, 45);
        this._name = lbl;

        let gun = new PlayerGunUI();
        gun.setAnchorPoint(0, 0.5);
        this._body.addChild(gun);
        gun.setPosition(10, 0);
        this._gun = gun;
    },

    setPlayerUIInfo: function (name) {
        this._name.setString(name);
    },

    setMyPlayer: function (isMyPlayer = true) {
        if (isMyPlayer) {
            this._name.setVisible(false);
        }
        else {
            this._name.setVisible(true);
        }
    },

    setPlayerRotation: function (deg) {
        let uiRotation = - deg;
        this._body.setRotation(uiRotation);
    },

    getPlayerRotation: function () {
        return this._body.getRotation();
    },

    equipGun: function (id) {
        this._gun.setVisible(true);
        this._leftArm.setPosition(37, 10);
        this._rightArm.setPosition(25, -10);
    },

    unEquip: function () {
        this._gun.setVisible(false);
        this._leftArm.setPosition(this._leftArm.defaultPosition);
        this._rightArm.setPosition(this._rightArm.defaultPosition);
    },

    isEquip: function () {
        return this._gun.isVisible();
    }
});

const PlayerGunUI = ccui.ImageView.extend({
    ctor: function (id) {
        this._id = null;
        this._super("res/Game/Player/gun_1.png");
    }
})