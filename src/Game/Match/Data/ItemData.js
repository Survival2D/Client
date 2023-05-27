/**
 * Created by quantm7 on 11/18/2022.
 */

const ItemData = MapObjectData.extend({
    ctor: function () {
        this._super();
        this._itemType = 0;
        this.radius = Config.ITEM_RADIUS;
    },

    setItemType: function (type) {
        this._itemType = type;
    },

    getItemType: function () {
        return this._itemType;
    }
});

const ItemGunData = ItemData.extend({
    ctor: function () {
        this._super();

        /**
         * @type {GunData.GUN_TYPE}
         * @private
         */
        this._gunType = GunData.GUN_TYPE.PISTOL;

        this._numBullets = 0;
    },

    /**
     * @param {GunData.GUN_TYPE} type
     */
    setGunType: function (type) {
        this._gunType = type;
    },

    /**
     * @return {GunData.GUN_TYPE}
     */
    getGunType: function () {
        return this._gunType;
    },

    setNumBullets: function (numBullets) {
        this._numBullets = numBullets;
    },

    getNumBullets: function () {
        return this._numBullets;
    }
});

const ItemBulletData = ItemData.extend({
    ctor: function () {
        this._super();
        this._numBullets = 0;
    },

    setNumBullets: function (numBullets) {
        this._numBullets = numBullets;
    },

    getNumBullets: function () {
        return this._numBullets;
    }
});

const ItemVestData = ItemData.extend({
    ctor: function () {
        this._super();
        this.vest = new VestData();
    }
});

const ItemHelmetData = ItemData.extend({
    ctor: function () {
        this._super();
        this.helmet = new HelmetData();
    }
});

const ItemBandageData = ItemData.extend({
    ctor: function () {
        this._super();
    }
});

const ItemMedKitData = ItemData.extend({
    ctor: function () {
        this._super();
    }
});