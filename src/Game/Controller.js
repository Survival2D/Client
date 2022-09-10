/**
 * Created by quantm7 on 9/10/2022.
 */

var Controller = cc.Class.extend({
    ctor: function () {
        this.isUp = false;
        this.isDown = false;
        this.isLeft = false;
        this.isRight = false;
    },

    onKeyPressed: function (keyCode) {
        cc.log(" Key Press: " + keyCode);
        switch (keyCode) {
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
        cc.log(" Key Release: " + keyCode);
        switch (keyCode) {
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
        }
    },

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
    }
});