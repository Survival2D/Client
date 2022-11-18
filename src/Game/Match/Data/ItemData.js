/**
 * Created by quantm7 on 11/18/2022.
 */

const ItemData = MapObjectData.extend({
    ctor: function () {
        this._super();
        this._itemType = 0;
        this.radius = 35;
    }
});

ItemData.TYPE = {
    GUN: "WEAPON",
    BULLET: "BULLET"
};

ItemData.createItemByType = function (type) {
    let item = new ItemData();

    switch (type) {
        case ItemData.TYPE.GUN:
            item = new ItemGunData();
            break;
        case ItemData.TYPE.BULLET:
            item = new ItemBulletData();
            break;
    }

    item.setObstacleType(type);

    return item;
};

const ItemGunData = ItemData.extend({
    ctor: function () {
        this._super();
        this._gunType = 0;
    },

    setGunType: function (type) {
        this._gunType = type;
    }
});

const ItemBulletData = ItemData.extend({
    ctor: function () {
        this._super();
        this._numBullets = 0;
    },

    setNumBullets: function (numBullets) {
        this._numBullets = numBullets;
    }
});