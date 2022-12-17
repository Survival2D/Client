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
        this.numBackBullets = 0;
        this.numBandages = 0;
        this.numMedKits = 0;

        this.weaponSlot = PlayerData.WEAPON_SLOT.FIST;

        this.radius = Config.PLAYER_RADIUS;
    },

    isDead: function () {
        return this.hp <= 0;
    },

    isHaveGun: function () {
        return this.gun.isActiveGun();
    },

    /**
     * @param {PlayerData.WEAPON_SLOT} slot
     */
    changeWeaponSlot: function (slot) {
        this.weaponSlot = slot;
    },

    canReloadBullets: function () {
        return this.gun.isActiveGun() && this.weaponSlot === PlayerData.WEAPON_SLOT.GUN && this.numBackBullets > 0;
    },

    reloadBullets: function (numWeaponBullets, numBulletsRemain) {
        this.gun.loadBullets(numWeaponBullets);
        this.numBackBullets = numBulletsRemain;
    },

    /**
     * @param {ItemData} item
     */
    getItem: function (item) {
        if (item instanceof ItemGunData) {
            this.gun.isActive = true;
            this.gun.loadBullets(item.getNumBullets());
        }
        if (item instanceof ItemBulletData) {
            this.numBackBullets += item.getNumBullets();
        }
        if (item instanceof ItemVestData) {
            this.vest = item.vest;
        }
        if (item instanceof ItemHelmetData) {
            this.helmet = item.helmet;
        }
        if (item instanceof ItemBandageData) {
            this.numBandages++;
        }
        if (item instanceof ItemMedKitData) {
            this.numMedKits++;
        }
    }
});

PlayerData.WEAPON_SLOT = {
    FIST: 0,
    GUN: 1
}