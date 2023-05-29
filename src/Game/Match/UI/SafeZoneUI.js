/**
 * Created by quantm7 on 12/6/2022.
 */

const SafeZoneUI = cc.Node.extend({
    ctor: function () {
        this._super();

        let jsonLayout = ccs.load(game_UIs.SAFE_ZONE_LAYER);
        this._layout = jsonLayout.node;
        this._action = jsonLayout.action;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.helper.doLayout(this._layout);
        this.addChild(this._layout);
        this._layout.setPosition(0, 0);

        this.initGUI();

        this.originRadius = 140;
    },

    initGUI: function () {
        this.pSafeZone = ccui.helper.seekWidgetByName(this._layout, "pSafeZone");
        let circle = ccui.helper.seekWidgetByName(this.pSafeZone, "circle");
        this.p1 = ccui.helper.seekWidgetByName(circle, "p1");
        this.p2 = ccui.helper.seekWidgetByName(circle, "p2");
        this.p3 = ccui.helper.seekWidgetByName(circle, "p3");
        this.p4 = ccui.helper.seekWidgetByName(circle, "p4");

        this.pSafeZone.setColor(cc.color("#FF0000"));
        this.pSafeZone.setOpacity(130);
    },

    setMapSize: function (width, height) {
        let szWidth = width * 3;
        let szHeight = height * 3;
        this.p1.setContentSize((szWidth - 1830) / 2, szHeight);
        this.p2.setContentSize((szWidth - 1830) / 2, szHeight);
        this.p3.setContentSize(1830, (szHeight - 1000) / 2);
        this.p4.setContentSize(1830, (szHeight - 1000) / 2);
    },

    /**
     * @param {SafeZoneData} data
     */
    setSafeZoneUI: function (data) {
        this.oldRadius = data.radius;
        this.oldPosition = gm.p(data.position.x, data.position.y);
        if (data.level === 0) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);

        this.pSafeZone.setPosition(data.position.x, data.position.y);
        this.pSafeZone.setScale(data.radius / this.originRadius);
    },

    /**
     * @param {SafeZoneData} data
     */
    animChangeSafeZone: function (data) {
        this.stopAllActions();

        if (data.level === 0) {
            this.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide()
            ));
            this.oldRadius = data.radius;
            this.oldPosition = gm.p(data.position.x, data.position.y);
            return;
        }

        this.setVisible(true);

        this.pSafeZone.stopAllActions();

        let deltaRadius = Math.abs(data.radius - this.oldRadius);
        let timeScale = deltaRadius / 1000;

        let distance_2 = (data.position.x - this.oldPosition.x)*(data.position.x - this.oldPosition.x) +
            (data.position.y - this.oldPosition.y)*(data.position.y - this.oldPosition.y);
        let timeMove = Math.sqrt(distance_2) / 1000;

        let destPos = cc.p(data.position.x, data.position.y);
        let destScale = data.radius / this.originRadius;

        if (data.level === 1) {
            this.pSafeZone.setPosition(destPos);
            this.pSafeZone.setScale(destScale);
            this.setOpacity(0);
            this.runAction(cc.fadeIn(0.2));
        }
        else {
            this.pSafeZone.runAction(cc.spawn(
                cc.moveTo(timeMove, destPos),
                cc.scaleTo(timeScale, destScale)
            ));
        }

        this.oldRadius = data.radius;
        this.oldPosition = gm.p(data.position.x, data.position.y);
    }
});

const SafeZoneMiniUI = ccui.ImageView.extend({
    ctor: function () {
        this._super("res/ui/Common/empty_circle.png", ccui.Widget.LOCAL_TEXTURE);
        this.orinWidth = this.getContentSize().width;
        this.setColor(cc.color(143, 0, 0));
    },

    /**
     * @param {SafeZoneData} data
     */
    setSafeZoneUI: function (data) {
        this.oldRadius = data.radius;
        this.oldPosition = gm.p(data.position.x, data.position.y);
        if (data.level === 0) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);
        this.setPosition(data.position);
        this.setScale(data.radius * 2 / this.orinWidth);
    },

    /**
     * @param {SafeZoneData} data
     */
    animChangeSafeZone: function (data) {
        this.stopAllActions();

        if (data.level === 0) {
            this.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide()
            ));
            this.oldRadius = data.radius;
            this.oldPosition = gm.p(data.position.x, data.position.y);
            return;
        }

        this.setVisible(true);

        let deltaRadius = Math.abs(data.radius - this.oldRadius);
        let timeScale = deltaRadius / 1000;

        let distance_2 = (data.position.x - this.oldPosition.x)*(data.position.x - this.oldPosition.x) +
            (data.position.y - this.oldPosition.y)*(data.position.y - this.oldPosition.y);
        let timeMove = Math.sqrt(distance_2) / 1000;

        if (data.level === 1) {
            this.setPosition(data.position);
            this.setScale(data.radius * 2 / this.orinWidth);
            this.setOpacity(0);
            this.runAction(cc.fadeIn(0.2));
        }
        else {
            this.runAction(cc.spawn(
                cc.moveTo(timeMove, data.position),
                cc.scaleTo(timeScale, data.radius * 2 / this.orinWidth)
            ));
        }

        this.oldRadius = data.radius;
        this.oldPosition = gm.p(data.position.x, data.position.y);
    }
})

const NextSafeZoneMiniUI = cc.Node.extend({
    ctor: function () {
        this._super();
    },

    /**
     * @param {SafeZoneData} data
     */
    setSafeZoneUI: function (data) {
        this.removeAllChildren(true);

        if (data.level === 0) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);

        let drawNode = new cc.DrawNode();
        drawNode.drawCircle(cc.p(0, 0), data.radius, 0, 1000, false, 10, cc.color("#FFFFFF"));
        this.addChild(drawNode);
        this.setPosition(data.position);
    },
})