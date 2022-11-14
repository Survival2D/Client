/**
 * Created by quantm7 on 10/2/2022.
 */

const BulletUI = cc.Node.extend({
    ctor: function () {
        this._super();

        this.trail = new cc.Sprite("res/Game/bullet_trail.png");
        this.addChild(this.trail);
        this.trail.setAnchorPoint(1, 0.5);
        this.trail.setPosition(0, 0);
        this.trail.setVisible(false);
    },

    setMoveDirection: function (vector = gm.vector(0, 1)) {
        this._directionVector = vector;
        this._directionVector.normalize();
        let rotation = gm.calculateVectorAngleInclination(vector);
        let uiRotation = - gm.radToDeg(rotation);
        this.trail.setRotation(uiRotation);
    },

    animFire: function () {
        this.trail.setVisible(true);
        this.trail.setScale(0);
        this.trail.setOpacity(0);
        this.trail.stopAllActions();
        this.trail.runAction(cc.scaleTo(0.3, 1).easing(cc.easeOut(2)));
        this.trail.runAction(cc.fadeIn(0.2));
    },

    updateBullet: function (dt) {
        let oldPos = this.getPosition();
        let newPos = gm.calculateNextPosition(oldPos, this._directionVector, Config.BULLET_BASE_SPEED);
        this.setPosition(newPos);
    }
});