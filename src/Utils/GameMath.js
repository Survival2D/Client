/**
 * Created by quantm7 on 9/10/2022.
 */

var gm = gm || {};

/**
 * @class gm.Position
 * @param {Number} x
 * @param {Number} y
 * @property x {Number}
 * @property y {Number}
 */
gm.Position = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

/**
 * gm.Position creator (wrap cc.p)
 * @function
 * @param {Number} x
 * @param {Number} y
 * @returns {gm.Position}
 */
gm.p = function (x, y) {
    return new gm.Position(x, y);
}

/**
 * @class gm.Vector
 * @param {Number} x
 * @param {Number} y
 * @property x {Number}
 * @property y {Number}
 */
gm.Vector = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

gm.Vector.prototype.normalize = function () {
    var length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length !== 0) {
        this.x /= length;
        this.y /= length;
    }
};

/**
 * gm.Vector creator
 * @function
 * @param {Number} x
 * @param {Number} y
 * @returns gm.Vector
 */
gm.vector = function (x, y) {
    x = x || 0;
    y = y || 0;
    return new gm.Vector(x, y);
};

/**
 * @param {gm.Position|cc.Point} oldPos
 * @param {gm.Vector} unitVector
 * @param {number=} speed
 * @return {gm.Position} next position
 */
gm.calculateNextPosition = function (oldPos, unitVector, speed) {
    if (speed === undefined) {
        speed = 1;
    }

    return gm.p(oldPos.x + unitVector.x * speed, oldPos.y + unitVector.y * speed);
};

/**
 * @param {gm.Vector|gm.Position} vectorOrOriginPos
 * @param {gm.Position=} destPos
 * @returns {number} angle between a vector (from originPos to destPos) and the positive haft of x axis
 */
gm.calculateVectorAngleInclination = function (vectorOrOriginPos, destPos) {
    let originPos = vectorOrOriginPos;
    if (destPos === undefined) {
        originPos = gm.p(0, 0);
        destPos = gm.calculateNextPosition(originPos, vectorOrOriginPos);
    }
    let dx = destPos.x - originPos.x;
    let dy = destPos.y - originPos.y;
    if (dx === 0) return 0;
    let angle = Math.atan(dy/dx);
    if (dx < 0) angle = Math.PI + angle;
    if (angle > Math.PI) angle = angle - 2 * Math.PI;
    return angle;
};

/**
 * @param {gm.Vector} vector
 */
gm.normalizeVector = function (vector) {
    var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length !== 0) {
        vector.x /= length;
        vector.y /= length;
    }
};

/**
 * @param degree
 * @returns {number} radiant
 */
gm.degToRad = function (degree) {
    return degree * Math.PI / 180;
}

/**
 * @param radiant
 * @returns {number} degree
 */
gm.radToDeg = function (radiant) {
    return radiant * 180 / Math.PI;
}