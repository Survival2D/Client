/**
 * Created by quantm7 on 10/2/2022.
 */

const BulletUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.trail = new cc.Sprite("res/Game/bulletTrail.png");
        this.addChild(this.trail);
        this.trail.setAnchorPoint(0.5, 0);
        this.trail.setPosition(0, 0);
        this.trail.setVisible(false);
    },

    animFire: function () {
        this.trail.setVisible(true);
        this.trail.setScale(0);
        this.trail.stopAllActions();
        this.trail.runAction(cc.scaleTo(0.15, 1).easing(cc.easeOut(2)));
    }
});