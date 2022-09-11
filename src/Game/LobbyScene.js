/**
 * Created by quantm7 on 9/11/2022.
 */

var LobbyScene = BaseLayer.extend({
    ctor: function () {
        this._super(LobbyScene.className);
        this.loadCss("LobbyScene.json");
    },

    initGUI: function () {
        this.pPlayers = this.getControl("pPlayers");
        this.customButton("btnStart", this.onStart, this);
    },

    onStart: function () {
        GameManager.getInstance().findMatchWithSquad();
    }
});

LobbyScene.className = "LobbyScene";