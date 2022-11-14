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
    if (dx === 0) {
        if (dy >= 0) return Math.PI/2;
        else return -Math.PI/2;
    }
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
};

/**
 * @param radiant
 * @returns {number} degree
 */
gm.radToDeg = function (radiant) {
    return radiant * 180 / Math.PI;
};

/**
 * check collision between 2 circles
 * @param {gm.Position} c1 - center of the 1st circle
 * @param {gm.Position} c2 - center of the 2nd circle
 * @param {number} r1 - radius of the 1st circle
 * @param {number} r2 - radius of the 2nd circle
 * @return {boolean}
 */
gm.checkCollisionCircleCircle = function (c1, c2, r1, r2) {
    let d_2 = (c1.x - c2.x)*(c1.x - c2.x) + (c1.y - c2.y)*(c1.y - c2.y);
    return (r1*r1 + r2*r2 >= d_2);
};

/**
 * check collision between 2 rectangles
 * @param {gm.Position} p1 - center of the 1st rectangle
 * @param {number} w1 - 1st rectangle width
 * @param {number} h1 - 1st rectangle height
 * @param {gm.Position} p2 - position of the 2nd rectangle
 * @param {number} w2 - 2nd rectangle width
 * @param {number} h2 - 2nd rectangle height
 * @return {boolean}
 */
gm.checkCollisionRectangleRectangle = function (p1, w1, h1, p2, w2, h2) {
    return p1.x <= p2.x + w2 &&
        p1.x + w1 >= p2.x &&
        p1.y <= p2.y + h2 &&
        p1.y + h1 >= p2.y
};

/**
 * check collision between a circle and a rectangle
 * @param {gm.Position} c1 - center of the circle
 * @param {number} r1 - radius of the circle
 * @param {gm.Position} p2 - position of the rectangle
 * @param {number} w2 - rectangle width
 * @param {number} h2 - rectangle height
 * @return {boolean}
 */
gm.checkCollisionCircleRectangle = function (c1, r1, p2, w2, h2) {
    let dx = Math.abs(c1.x - (p2.x + w2/2));
    let dy = Math.abs(c1.y - (p2.y + h2/2));
    if (dx > r1 + w2/2) return false;
    if (dy > r1 + h2/2) return false;
    if (dx <= w2/2) return true;
    if (dy <= h2/2) return true;
    let dCorner_2 = (dx - w2/2)*(dx - w2/2) + (dy - h2/2)*(dy - h2/2);
    return dCorner_2 <= r1*r1;
};