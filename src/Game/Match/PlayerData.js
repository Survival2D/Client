/**
 * Created by quantm7 on 9/28/2022.
 */

const PlayerData = cc.Class.extend({
    ctor: function () {
        this.username = "";
        this.playerId = "";
        this.position = gm.p(0, 0);
        this.rotation = 0;
        this.speed = 0;
        this.team = 0;
        this.hp = 0;
    }
});