/**
 * Created by quantm7 on 9/18/2022.
 */

var MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";
    },

    newMatch: function (matchId) {
        this.matchId = "";
        SceneManager.getInstance().openGameScene();
    }
});