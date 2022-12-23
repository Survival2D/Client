/**
 * Created by quantm7 on 12/6/2022.
 */

const SafeZoneUI = cc.Node.extend({
    ctor: function () {
        this._super();

        this.safeZoneCircle = new ccui.ImageView("res/ui/Common/empty_circle.png");
        this.addChild(this.safeZoneCircle);
        this.safeZoneCircle.setColor(cc.color("#FF0000"));
        this.safeZoneCircle.originRadius = this.safeZoneCircle.width/2;
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

        this.safeZoneCircle.setPosition(data.position.x - Config.MAP_WIDTH/2, data.position.y - Config.MAP_HEIGHT/2);
        this.safeZoneCircle.setScale(data.radius / this.safeZoneCircle.originRadius);
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

        this.safeZoneCircle.stopAllActions();

        let deltaRadius = Math.abs(data.radius - this.oldRadius);
        let timeScale = deltaRadius / 1000;

        let distance_2 = (data.position.x - this.oldPosition.x)*(data.position.x - this.oldPosition.x) +
            (data.position.y - this.oldPosition.y)*(data.position.y - this.oldPosition.y);
        let timeMove = Math.sqrt(distance_2) / 1000;

        let destPos = cc.p(data.position.x - Config.MAP_WIDTH/2, data.position.y - Config.MAP_HEIGHT/2);
        let destScale = data.radius / this.safeZoneCircle.orinWidth;

        if (data.level === 1) {
            this.safeZoneCircle.setPosition(destPos);
            this.safeZoneCircle.setScale(destScale);
            this.setOpacity(0);
            this.runAction(cc.fadeIn(0.2));
        }
        else {
            this.safeZoneCircle.runAction(cc.spawn(
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