/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleUI = ccui.ImageView.extend({
    ctor: function (path, textureType) {
        this._super(path, textureType);
        this._obstacleId = 0;
        this.ignoreContentAdaptWithSize(false);
    },

    setObstacleId: function (id) {
        this._obstacleId = id;
    },

    getObstacleId: function () {
        return this._obstacleId;
    },

    animTakeDamage: function (hpRatio) {
        this.stopAllActions();
        this.runAction(cc.scaleTo(0.3, 0.5 + hpRatio * 0.5).easing(cc.easeBackInOut()));
    },

    animDestroyed: function () {
        this.removeFromParent(true);
    }
});

const TreeUI = ObstacleUI.extend({
    ctor: function () {
        this._super("res/Game/Obstacle/tree.png", ccui.Widget.LOCAL_TEXTURE);
    }
});

const CrateUI = ObstacleUI.extend({
    ctor: function () {
        this._super("res/Game/Obstacle/crate.png", ccui.Widget.LOCAL_TEXTURE);
    }
});
