/**
 * Created by quantm7 on 11/18/2022.
 */

const ItemUI = ccui.ImageView.extend({
    ctor: function (path, textureType) {
        this._super(path, textureType);
        this.ignoreContentAdaptWithSize(false);
        this._itemId = 0;
    },

    setItemId: function (id) {
        this._itemId = id;
    },

    getItemId: function () {
        return this._itemId;
    },

    animTaken: function () {
        this.stopAllActions();
        this.runAction(cc.sequence(
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.removeSelf(true)
        ));
    }
});

const ItemGunUI = ItemUI.extend({
    ctor: function () {
        this._super("res/Game/Item/loot_outer.png", ccui.Widget.LOCAL_TEXTURE);
        this.setContentSize(80, 80);

        let gun = new ccui.ImageView("res/Game/Item/loot_gun.png");
        gun.ignoreContentAdaptWithSize(false);
        gun.setContentSize(70, 70);
        this.addChild(gun);
        gun.setPosition(this.width/2, this.height/2);
    }
});

const ItemBulletUI = ItemUI.extend({
    ctor: function () {
        this._super("res/Game/Item/loot_ammo.png", ccui.Widget.LOCAL_TEXTURE);
        this.setContentSize(70, 70);
    }
});

const ItemVestUI = ItemUI.extend({
    ctor: function () {
        this._super("res/Game/Item/loot_outer.png", ccui.Widget.LOCAL_TEXTURE);
        this.setContentSize(80, 80);

        let gun = new ccui.ImageView("res/Game/Item/loot_chest.png");
        gun.ignoreContentAdaptWithSize(false);
        gun.setContentSize(70, 70);
        this.addChild(gun);
        gun.setPosition(this.width/2, this.height/2);
    }
});

const ItemHelmetUI = ItemUI.extend({
    ctor: function () {
        this._super("res/Game/Item/loot_outer.png", ccui.Widget.LOCAL_TEXTURE);
        this.setContentSize(80, 80);

        let gun = new ccui.ImageView("res/Game/Item/loot_helmet.png");
        gun.ignoreContentAdaptWithSize(false);
        gun.setContentSize(70, 70);
        this.addChild(gun);
        gun.setPosition(this.width/2, this.height/2);
    }
});