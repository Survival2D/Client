/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleData = cc.Class.extend({
    ctor: function () {
        this.type = 0;
        this.position = gm.p(0, 0);
        this.radius = 35;
    }
})