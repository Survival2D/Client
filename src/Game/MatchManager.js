/**
 * Created by quantm7 on 9/18/2022.
 */

const MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";

        this.players = [];

        this.mapWidth = 1280;
        this.mapHeight = 720;

        this.scene = null;
    },

    newMatch: function (matchId) {
        this.matchId = "";
        this.scene = SceneManager.getInstance().openMatchScene();
        this.scene.updateMatchView();
    },

    isInMatch: function () {
        return SceneManager.getInstance().getMainLayer() instanceof MatchScene && this.scene !== null;
    },

    updateMatchInfo: function (players) {
        this.players = players;

        if (this.isInMatch()) this.scene.updateMatchView();
    },

    updatePlayerMove: function (playerId, pos, rotation) {
        let player = this.players[playerId];
        if (!player) {
            cc.log("Warning: we dont have player " + playerId + " in match");
            return;
        }
        player.position = pos;
        player.rotation = rotation;

        if (this.isInMatch()) this.scene.updateMatchView();
    }
});