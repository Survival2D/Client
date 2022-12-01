/**
 * Created by quantm7 on 9/28/2022.
 */

const PlayerData = cc.Class.extend({
    ctor: function () {
        this.username = "";
        this.position = gm.p(0, 0);
        this.rotation = 0;
        this.movingUnitVector = gm.vector(0, 0);
        this.speed = 0;
        this.team = 0;
        this.hp = 0;
        this.gun = new GunData();
        this.vest = new VestData();
        this.helmet = new HelmetData();

        this.radius = Config.PLAYER_RADIUS;
    },

    isDead: function () {
        return this.hp <= 0;
    },

    isHaveGun: function () {
        return this.gun.isActiveGun();
    },

    /**
     * @param {ItemGunData} itemGun
     */
    getGun: function (itemGun) {
        this.gun.activeGun();
        this.gun.loadBullets(itemGun.getNumBullets());
    }
});

PlayerData.WEAPON_SLOT = {
    FIST: 0,
    GUN: 1
}