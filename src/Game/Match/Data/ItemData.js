/**
 * Created by quantm7 on 11/18/2022.
 */

const ItemData = MapObjectData.extend({
    ctor: function () {
        this._super();
        this._itemType = 0;
        this.radius = 35;
    },

    setItemType: function (type) {
        this._itemType = type;
    },

    getItemType: function () {
        return this._itemType;
    }
});

ItemData.TYPE = {
    GUN: "WEAPON",
    BULLET: "BULLET"
};

ItemData.createItemByType = function (type) {
    let item = new ItemData();

    cc.log("DMM ", type);

    switch (type) {
        case ItemData.TYPE.GUN:
            item = new ItemGunData();
            break;
        case ItemData.TYPE.BULLET:
            item = new ItemBulletData();
            break;
    }

    item.setItemType(type);

    return item;
};

const ItemGunData = ItemData.extend({
    ctor: function () {
        this._super();
        this._gunType = 0;
        this._numBullets = 0;
    },

    setGunType: function (type) {
        this._gunType = type;
    },

    setNumBullets: function (numBullets) {
        this._numBullets = numBullets;
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