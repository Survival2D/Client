/**
 * Created by quantm7 on 12/1/2022.
 */

const GunData = cc.Class.extend({
    ctor: function () {
        this.isActive = false;
        this.numBullets = 0;

        /**
         * @type {GunData.GUN_TYPE}
         */
        this.type = GunData.GUN_TYPE.NORMAL
    },

    loadBullets: function (numBullets) {
        this.numBullets = numBullets;
    },

    canFire: function () {
        return this.isActive && this.numBullets > 0;
    },

    isActiveGun: function () {
        return this.isActive;
    }
});

GunData.GUN_TYPE = {
    NORMAL: 1,
    SHORT: 2,
    LONG: 3,
}