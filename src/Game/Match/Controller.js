/**
 * Created by quantm7 on 9/10/2022.
 */

const Controller = cc.Class.extend({
    ctor: function () {
        this.isUp = false;
        this.isDown = false;
        this.isLeft = false;
        this.isRight = false;

        this.destPos = gm.p(0, 0);
        this.isAttacking = false;

        this._controllerEnabled = false;
    },

    setControllerEnabled: function (enabled) {
        this._controllerEnabled = enabled || false;
    },

    onKeyPressed: function (keyCode) {
        if (!this._controllerEnabled) return;
        Controller.log(" Key Press: " + keyCode);
        switch (keyCode) {
            // move keys
            case cc.KEY.w:
                this.isUp = true;
                break;
            case cc.KEY.a:
                this.isLeft = true;
                break;
            case cc.KEY.s:
                this.isDown = true;
                break;
            case cc.KEY.d:
                this.isRight = true;
                break;
        }
    },

    onKeyReleased: function (keyCode) {
        if (!this._controllerEnabled) return;
        Controller.log(" Key Release: " + keyCode);
        switch (keyCode) {
            // move keys
            case cc.KEY.w:
                this.isUp = false;
                break;
            case cc.KEY.a:
                this.isLeft = false;
                break;
            case cc.KEY.s:
                this.isDown = false;
                break;
            case cc.KEY.d:
                this.isRight = false;
                break;

            // control keys
            case cc.KEY.f:
                this.pickItem();
                break;
            case cc.KEY.r:
                this.reloadBullets();
                break;
            case cc.KEY.b:
                Config.ENABLE_AUTO_PLAY = !Config.ENABLE_AUTO_PLAY;
                GameManager.getInstance().getCurrentMatch().requestAutoPlay();
                break;
            case cc.KEY["1"]:
                this.changeWeaponSlot(PlayerData.WEAPON_SLOT.FIST);
                break;
            case cc.KEY["2"]:
                this.changeWeaponSlot(PlayerData.WEAPON_SLOT.PISTOL);
                break;
            case cc.KEY["3"]:
                this.changeWeaponSlot(PlayerData.WEAPON_SLOT.SHOTGUN);
                break;
            case cc.KEY["4"]:
                this.changeWeaponSlot(PlayerData.WEAPON_SLOT.SNIPER);
                break;
            case cc.KEY["5"]: {
                let match = GameManager.getInstance().getCurrentMatch();
                if (match) match.myPlayerUseBandage();
                break;
            }
            case cc.KEY["6"]: {
                let match = GameManager.getInstance().getCurrentMatch();
                if (match) match.myPlayerUseMedKit();
                break;
            }
        }
    },

    onMouseDown: function (x = 0, y = 0) {
        if (!this._controllerEnabled) return;
        Controller.log("Mouse Down: " + x + ", " + y);
        this.isAttacking = true;
    },

    onMouseUp: function (x = 0, y = 0) {
        if (!this._controllerEnabled) return;
        Controller.log("Mouse Up: " + x + ", " + y);
    },

    onMouseMove: function (x = 0, y = 0) {
        if (!this._controllerEnabled) return;
        Controller.log("Mouse Move: " + x + ", " + y);
        this.destPos = gm.p(x, y);
    },

    onMouseScroll: function () {
        if (!this._controllerEnabled) return;
    },

    // dispatch controller event functions group

    pickItem: function () {
        GameManager.getInstance().getCurrentMatch().scene.myPlayerPickItem();
    },

    reloadBullets: function () {
        GameManager.getInstance().getCurrentMatch().reloadMyPlayerWeapon();
    },

    changeWeaponSlot: function (slot) {
        GameManager.getInstance().getCurrentMatch().scene.myPlayerChangeWeapon(slot);
    },

    checkAttacking: function () {
        let isAttack = this.isAttacking;
        this.isAttacking = false;

        return isAttack;
    },

    getDestPosition: function () {
        return this.destPos;
    },

    // get data from controller functions group

    /**
     * @returns {gm.Vector}
     */
    calculateMovementVector: function () {
        let vector = gm.vector(0, 0);

        if (this.isUp) vector.y += 1;
        if (this.isDown) vector.y -= 1;
        if (this.isLeft) vector.x -= 1;
        if (this.isRight) vector.x += 1;

        vector.normalize();

        return vector;
    },

    calculateRotation: function (originPos = gm.p(0, 0)) {
        return gm.calculateVectorAngleInclination(originPos, this.destPos);
    }
});

Controller.ENABLE_LOG_INPUT = false;

Controller.log = function () {
    if (Controller.ENABLE_LOG_INPUT) cc.log.apply(null, arguments);
}