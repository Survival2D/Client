/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleData = MapObjectData.extend({
    ctor: function () {
        this._obstacleType = 0;
        this.hp = 0;
        this.maxHp = 0;
    },

    setObstacleId: function (id) {
        this._objectId = id;
    },

    getObstacleId: function () {
        return this._objectId;
    },

    setObstacleType: function (type) {
        this._obstacleType = type;
    },

    getObstacleType: function () {
        return this._obstacleType;
    }
});

ObstacleData.TYPE = {
    TREE: 1,
    CRATE: 2
};

ObstacleData.createObstacleByType = function (type) {
    let obs = new ObstacleData();

    switch (type) {
        case ObstacleData.TYPE.TREE:
            obs = new TreeData();
            break;
        case ObstacleData.TYPE.CRATE:
            obs = new CrateData();
            break;
    }

    obs.setObstacleType(type);

    return obs;
};

const TreeData = ObstacleData.extend({
    ctor: function () {
        this.radius = 35;
    }
});

const CrateData = ObstacleData.extend({
    ctor: function () {
        this.width = 100;
        this.height = 100;
        this.numHitToBreak = 5;
    }
});