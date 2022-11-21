/**
 * Created by quantm7 on 11/3/2022.
 */

const BulletData = cc.Class.extend({
    ctor: function () {
        this.id = 0;
        this.position = gm.p(0, 0);
        this.rawPosition = gm.p(0, 0);
        this.direction = gm.vector(0, 0);
        this.bulletType = "";
        this.ownerId = "";
    }
});