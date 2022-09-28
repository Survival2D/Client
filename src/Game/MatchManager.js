/**
 * Created by quantm7 on 9/18/2022.
 */

const MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";

        this.players = [];

        this.scene = null;
    },

    newMatch: function (matchId) {
        this.matchId = "";
        this.scene = SceneManager.getInstance().openMatchScene();
        this.scene.updateMatchView();
    }
});