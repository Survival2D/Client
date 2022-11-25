/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleData = MapObjectData.extend({
    ctor: function () {
        this._super();
        this._obstacleType = 0;
        this.hp = 0;
        this.maxHp = 100;
    },

    setObstacleType: function (type) {
        this._obstacleType = type;
    },

    getObstacleType: function () {
        return this._obstacleType;
    }
});

ObstacleData.TYPE = {
    TREE: "TREE",
    CRATE: "CONTAINER",
    STONE: "STONE",
    WALL: "WALL"
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
        case ObstacleData.TYPE.STONE:
            obs = new StoneData();
            break;
        case ObstacleData.TYPE.WALL:
            obs = new WallData();
            break;
    }

    obs.setObstacleType(type);

    return obs;
};

const TreeData = ObstacleData.extend({
    ctor: function () {
        this._super();
        this.radius = Config.TREE_RADIUS;
    }
});

const CrateData = ObstacleData.extend({
    ctor: function () {
        this._super();
        this.width = Config.CRATE_WIDTH;
        this.height = Config.CRATE_HEIGHT;
    }
});

const StoneData = ObstacleData.extend({
    ctor: function () {
        this._super();
        this.radius = Config.STONE_RADIUS;
    }
});

const WallData = ObstacleData.extend({
    ctor: function () {
        this._super();
        this.width = Config.WALL_WIDTH;
        this.height = Config.WALL_HEIGHT;
    }
});