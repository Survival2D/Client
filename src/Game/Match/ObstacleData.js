/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleData = cc.Class.extend({
    ctor: function () {
        this.type = 0;
        this.position = gm.p(0, 0);
    }
});

ObstacleData.TYPE = {
    TREE: 1,
    CRATE: 2
};

const TreeData = cc.Class.extend({
    ctor: function () {
        this.type = ObstacleData.TYPE.TREE;
        this.radius = 35;
    }
});

const CrateData = cc.Class.extend({
    ctor: function () {
        this.type = ObstacleData.TYPE.CRATE;
        this.width = 100;
        this.height = 100;
        this.numHitToBreak = 5;
    }
});