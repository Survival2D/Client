/**
 * Created by quantm7 on 11/18/2022.
 */

const ItemUI = ccui.ImageView.extend({
    ctor: function () {
        this._super("res/ui/Game/Item/loot_outer.png", ccui.Widget.LOCAL_TEXTURE);
        this.ignoreContentAdaptWithSize(false);
        this.setContentSize(80, 80);

        this._itemId = 0;
    },

    setItemUI: function (path) {
        let item = new ccui.ImageView(path, ccui.Widget.LOCAL_TEXTURE);
        item.ignoreContentAdaptWithSize(false);
        item.setContentSize(70, 70);
        this.addChild(item);
        item.setPosition(this.width/2, this.height/2);
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
        this._super();

        this.setItemUI("res/ui/Game/Item/loot_gun.png");
    }
});

const ItemBulletUI = ItemUI.extend({
    ctor: function () {
        this._super();
        this.loadTexture("res/ui/Game/Item/loot_ammo.png", ccui.Widget.LOCAL_TEXTURE);
        this.setContentSize(70, 70);
    }
});

const ItemVestUI = ItemUI.extend({
    ctor: function () {
        this._super("res/ui/Game/Item/loot_outer.png", ccui.Widget.LOCAL_TEXTURE);

        this.setItemUI("res/ui/Game/Item/loot_chest.png");
    }
});

const ItemHelmetUI = ItemUI.extend({
    ctor: function () {
        this._super();

        this.setItemUI("res/ui/Game/Item/loot_helmet.png");
    }
});

const ItemBandageUI = ItemUI.extend({
    ctor: function () {
        this._super();

        this.setItemUI("res/ui/Game/Item/loot_medical_bandage.png");
    }
});

const ItemMedKitUI = ItemUI.extend({
    ctor: function () {
        this._super();

        this.setItemUI("res/ui/Game/Item/loot_health_care.png");
    }
});