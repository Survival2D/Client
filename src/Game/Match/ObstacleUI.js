/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleUI = ccui.ImageView.extend({
    ctor: function (path, textureType) {
        this._super(path, textureType);
        this.type = 0;
        this.ignoreContentAdaptWithSize(false);
    }
});

const TreeUI = ObstacleUI.extend({
    ctor: function () {
        this._super("res/Game/Obstacle/tree.png", ccui.Widget.LOCAL_TEXTURE);
        this.type = ObstacleData.TYPE.TREE;
    }
});

const CrateUI = ObstacleUI.extend({
    ctor: function () {
        this._super("res/Game/Obstacle/crate.png", ccui.Widget.LOCAL_TEXTURE);
        this.type = ObstacleData.TYPE.CRATE;
    }
});
