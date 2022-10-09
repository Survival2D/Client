/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleUI = ccui.ImageView.extend({
    ctor: function (type) {
        this._super();
        this.type = type;
    }
});

const TreeUI = ObstacleUI.extend({
    ctor: function () {
        this._super(1);
        this.radius = 10;
        this.loadTexture("res/Game/Obstacle/tree.png");
    }
});
