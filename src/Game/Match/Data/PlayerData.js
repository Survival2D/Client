/**
 * Created by quantm7 on 9/28/2022.
 */

const PlayerData = cc.Class.extend({
    ctor: function () {
        this.playerId = 0;
        this.playerName = "";
        this.position = gm.p(0, 0);
        this.rotation = 0;
        this.movingUnitVector = gm.vector(0, 0);
        this.speed = 0;
        this.team = 0;
        this.hp = 0;

        /**
         * @type [GunData]
         */
        this.guns = [];
        for (let type of GunData.GUN_TYPE) {
            let gun = new GunData();
            gun.type = type;
            gun.setActive(true);
            this.guns.push(gun);
        }

        this.vest = new VestData();
        this.helmet = new HelmetData();
        this.numBackBullets = {}; // map from gun type -> number of bullets of that type
        this.numBackBullets[GunData.GUN_TYPE.PISTOL] = 0;
        this.numBackBullets[GunData.GUN_TYPE.SHOTGUN] = 0;
        this.numBackBullets[GunData.GUN_TYPE.SNIPER] = 0;

        this.numBandages = 0;
        this.numMedKits = 0;

        this.weaponSlot = PlayerData.WEAPON_SLOT.FIST;

        this.radius = Config.PLAYER_RADIUS;
    },

    isDead: function () {
        return this.hp <= 0;
    },

    /**
     * @param type {GunData.GUN_TYPE}
     * @return boolean
     */
    isHaveGun: function (type) {
        let gun = this.getGun(type);
        if (gun) return gun.isActiveGun();
        else return false;
    },

    /**
     * @param type {GunData.GUN_TYPE}
     * @return GunData|null
     */
    getGun: function (type) {
        for (let gun of this.guns) {
            if (gun.type === type) return gun;
        }

        return null;
    },

    /**
     * @return {GunData|null}
     */
    getCurrentGun: function () {
        /**
         * @type GunData
         */
        let gun;
        switch (this.weaponSlot) {
            case PlayerData.WEAPON_SLOT.PISTOL:
                gun = this.getGun(GunData.GUN_TYPE.PISTOL);
                break;
            case PlayerData.WEAPON_SLOT.SHOTGUN:
                gun = this.getGun(GunData.GUN_TYPE.SHOTGUN);
                break;
            case PlayerData.WEAPON_SLOT.SNIPER:
                gun = this.getGun(GunData.GUN_TYPE.SNIPER);
                break;
            default: gun = null; break;
        }
        return gun;
    },

    /**
     * @param {PlayerData.WEAPON_SLOT} slot
     */
    changeWeaponSlot: function (slot) {
        this.weaponSlot = slot;
    },

    canFire: function () {
        /**
         * @type GunData
         */
        let gun = this.getCurrentGun();

        if (gun) return gun.canFire();
        else return false;
    },

    fire: function () {
        /**
         * @type GunData
         */
        let gun = this.getCurrentGun();
        if (gun) return gun.numBullets--;
    },

    canReloadBullets: function () {
        /**
         * @type GunData
         */
        let gun = this.getCurrentGun();

        if (gun) return gun.isActiveGun() && this.numBackBullets[gun.type] > 0;
        else return false;
    },

    /**
     * @param {GunData.GUN_TYPE} gunType
     * @param {number} numWeaponBullets
     * @param {number} numBulletsRemain
     */
    reloadBullets: function (gunType, numWeaponBullets, numBulletsRemain) {
        let gun = this.getGun(gunType);
        if (gun) {
            gun.loadBullets(numWeaponBullets);
        }
        this.numBackBullets[gunType] = numBulletsRemain;
    },

    /**
     * @param {ItemData} item
     */
    getItem: function (item) {
        if (item instanceof ItemGunData) {
            let gun = this.getGun(item.getGunType());
            gun.setActive(true);
            gun.loadBullets(item.getNumBullets());
        }
        if (item instanceof ItemBulletData) {
            this.numBackBullets[item.getGunType()] += item.getNumBullets();
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
    PISTOL: 1,
    SHOTGUN: 2,
    SNIPER: 3,
}