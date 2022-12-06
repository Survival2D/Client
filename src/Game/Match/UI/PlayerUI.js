/**
 * Created by quantm7 on 9/11/2022.
 */

const PlayerUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.initPlayerUI();
    },

    initPlayerUI: function () {
        let body = new ccui.ImageView("res/ui/Game/Player/circle.png");
        body.ignoreContentAdaptWithSize(false);
        body.setColor(cc.color("#f8c574"));
        body.setContentSize(Config.PLAYER_RADIUS * 2, Config.PLAYER_RADIUS * 2);
        this.addChild(body);
        this._body = body;

        let arm = new ccui.ImageView("res/ui/Game/Player/circle.png");
        arm.ignoreContentAdaptWithSize(false);
        arm.setColor(cc.color("#f8c574"));
        arm.setContentSize(body.width * 0.35, body.height * 0.35);
        this._body.addChild(arm, 1);
        arm.setPosition(this._body.width/2 + 30, this._body.height/2 + 20);
        this._leftArm = arm;
        this._leftArm.defaultPosition = this._leftArm.getPosition();
        let armBorder = new ccui.ImageView("res/ui/Game/Player/circle.png");
        armBorder.ignoreContentAdaptWithSize(false);
        armBorder.setColor(cc.color("#000000"));
        armBorder.setContentSize(arm.width + 8, arm.height + 8);
        arm.addChild(armBorder, - 1);
        armBorder.setPosition(arm.width/2, arm.height/2);

        arm = new ccui.ImageView("res/ui/Game/Player/circle.png");
        arm.ignoreContentAdaptWithSize(false);
        arm.setColor(cc.color("#f8c574"));
        arm.setContentSize(body.width * 0.35, body.height * 0.35);
        this._body.addChild(arm, 1);
        arm.setPosition(this._body.width/2 + 30, this._body.height/2 - 20);
        this._rightArm = arm;
        this._rightArm.defaultPosition = this._rightArm.getPosition();
        armBorder = new ccui.ImageView("res/ui/Game/Player/circle.png");
        armBorder.ignoreContentAdaptWithSize(false);
        armBorder.setColor(cc.color("#000000"));
        armBorder.setContentSize(arm.width + 8, arm.height + 8);
        arm.addChild(armBorder, - 1);
        armBorder.setPosition(arm.width/2, arm.height/2);

        let vest = new ccui.ImageView("res/ui/Game/Player/circle.png");
        vest.ignoreContentAdaptWithSize(false);
        vest.setColor(cc.color("#9E9E9E"));
        vest.setContentSize(body.width + 10, body.height + 10);
        this._body.addChild(vest, -1);
        vest.setPosition(this._body.width/2, this._body.height/2);
        this._vest = vest;

        let helmet = new ccui.ImageView("res/ui/Game/Player/circle.png");
        helmet.ignoreContentAdaptWithSize(false);
        helmet.setColor(cc.color("#004801"));
        helmet.setContentSize(body.width * 0.5, body.height * 0.5);
        this._body.addChild(helmet, 2);
        helmet.setPosition(this._body.width * 0.45, this._body.height * 0.5);
        this._helmet = helmet;
        let helmetBorder = new ccui.ImageView("res/ui/Game/Player/circle.png");
        helmetBorder.ignoreContentAdaptWithSize(false);
        helmetBorder.setColor(cc.color("#1E1E1E"));
        helmetBorder.setContentSize(helmet.width + 8, helmet.height + 8);
        helmet.addChild(helmetBorder, -1);
        helmetBorder.setPosition(helmet.width/2, helmet.height/2);


        let lbl = new ccui.Text("Name", game_fonts.bold, 24);
        lbl.enableOutline(cc.color(0, 0, 0, 170), 1);
        this.addChild(lbl);
        lbl.setPosition(0, 50);
        this._name = lbl;

        let gun = new PlayerGunUI();
        gun.setAnchorPoint(0, 0.5);
        this._body.addChild(gun, -2);
        gun.setPosition(this._body.width/2 + 15, this._body.height/2);
        this._gun = gun;
    },

    setPlayerUIInfo: function (name) {
        this._name.setString(name);
    },

    setPlayerColorByTeam: function (team) {
        let color = Constant.PLAYER_COLOR[team % 2];
        this._body.setColor(color);
        this._leftArm.setColor(color);
        this._rightArm.setColor(color);
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
        let uiRotation = -deg;
        this._body.setRotation(uiRotation);
    },

    getPlayerRotation: function () {
        return -this._body.getRotation();
    },

    setVestLevel: function (level) {
        if (level === 0) {
            this._vest.setVisible(false);
            return;
        }

        this._vest.setVisible(true);
        let color = this._vest.getColor();
        color.r += (level - 1) * 10;
        color.g += (level - 1) * 10;
        color.b += (level - 1) * 10;
        this._vest.setColor(color);
    },

    setHelmetLevel: function (level) {
        if (level === 0) {
            this._helmet.setVisible(false);
            return;
        }

        this._helmet.setVisible(true);
        let color = this._helmet.getColor();
        color.r += (level - 1) * 10;
        color.g += (level - 1) * 10;
        color.b += (level - 1) * 10;
        this._helmet.setColor(color);
    },

    equipGun: function (id) {
        this._gun.setVisible(true);
        this._leftArm.setPosition(this._body.width/2 + 48, this._body.height/2 + 5);
        this._rightArm.setPosition(this._body.width/2 + 20, this._body.height/2 - 3);
    },

    unEquip: function () {
        this._gun.setVisible(false);
        this._leftArm.setPosition(this._leftArm.defaultPosition);
        this._rightArm.setPosition(this._rightArm.defaultPosition);
    },

    isEquip: function () {
        return this._gun.isVisible();
    },

    animAttack: function () {
        if (!this.isEquip()) {
            if (Math.random() > 0.5) {
                this._leftArm.stopAllActions();
                this._leftArm.runAction(cc.sequence(
                    cc.moveTo(0.1, this._body.width/2 + 45, this._body.height/2 + 10).easing(cc.easeSineIn()),
                    cc.moveTo(0.1, this._leftArm.defaultPosition).easing(cc.easeSineOut())
                ));
            }
            else {
                this._rightArm.stopAllActions();
                this._rightArm.runAction(cc.sequence(
                    cc.moveTo(0.1, this._body.width/2 + 45, this._body.height/2 - 10).easing(cc.easeSineIn()),
                    cc.moveTo(0.1, this._rightArm.defaultPosition).easing(cc.easeSineOut())
                ));
            }
        }
    },

    animTakeDamage: function () {
        this.stopAllActions();
        this.runAction(cc.sequence(
            cc.fadeTo(0.1, 50),
            cc.fadeIn(0.1)
        ));
    },

    animDead: function () {
        this.stopAllActions();
        this.runAction(cc.spawn(
            cc.fadeOut(0.1),
            cc.scaleTo(0.1, 1.5),
            cc.removeSelf(true)
        ));
    }
});

const PlayerGunUI = ccui.ImageView.extend({
    ctor: function (id) {
        this._id = null;
        this._super("res/ui/Game/Player/gun_1.png");
    }
});

const MiniPlayerUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.initPlayerUI();
    },

    initPlayerUI: function () {
        let drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 20, cc.color("#f8c574"));
        this.addChild(drawNode);
        this._body = drawNode;
    },

    setPlayerColorByTeam: function (team) {
        let color = Constant.PLAYER_COLOR[team % 2];
        this._body.setColor(color);
    },
});