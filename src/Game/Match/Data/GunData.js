/**
 * Created by quantm7 on 12/1/2022.
 */

const GunData = cc.Class.extend({
    ctor: function () {
        this.isActive = false;
        this.numBullets = 0;
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