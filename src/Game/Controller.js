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
    },

    onKeyPressed: function (keyCode) {
        Controller.log(" Key Press: " + keyCode);
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
        Controller.log(" Key Release: " + keyCode);
        switch (keyCode) {
            // move keyboard
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

            // control keyboard
            case cc.KEY.f:

                break;
        }
    },

    onMouseDown: function (x = 0, y = 0) {
        Controller.log("Mouse Down: " + x + ", " + y);
    },

    onMouseUp: function (x = 0, y = 0) {
        Controller.log("Mouse Up: " + x + ", " + y);
    },

    onMouseMove: function (x = 0, y = 0) {
        Controller.log("Mouse Move: " + x + ", " + y);
        this.destPos = gm.p(x, y);
    },

    onMouseScroll: function () {

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
    },

    calculateRotation: function (originPos = gm.p(0, 0)) {
        let dx = this.destPos.x - originPos.x;
        let dy = this.destPos.y - originPos.y;
        let angle = Math.atan(dx/dy);
        if (dy < 0) angle = Math.PI + angle;

        return angle;
    }
});

Controller.ENABLE_LOG_INPUT = false;

Controller.log = function () {
    if (Controller.ENABLE_LOG_INPUT) cc.log.apply(null, arguments);
}