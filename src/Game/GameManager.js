/**
 * Created by quantm7 on 9/11/2022.
 */

var GameManager = cc.Class.extend({
    ctor: function () {
        this.userData = new UserData();
        this.match = null;
    },

    findMatch: function () {
        GameClient.getInstance().sendFindMatch();
    },

    joinTeam: function () {
        GameClient.getInstance().sendJoinTeam();
    },

    createTeam: function () {
        GameClient.getInstance().sendCreateTeam();
    },

    findMatchWithTeam: function () {

    },

    onReceivedFindMatch: function (error, gameId) {
        if (!error) {
            this.match = new MatchManager();
            this.match.newMatch(gameId);
        }
    },

    onReceivedCreateTeam: function (error, teamId) {
        if (!error) {
            SceneManager.getInstance().openLobbyScene();
        }
    },

    onReceivedJoinTeam: function (error, teamId) {
        if (!error) {
            SceneManager.getInstance().openLobbyScene();
        }
    },

    /**
     * @returns {null|MatchManager}
     */
    getCurrentMatch: function () {
        return this.match;
    }
});

/**
 * @returns {GameManager}
 */
GameManager.getInstance = function () {
    if (!this._instance) this._instance = new GameManager();
    return this._instance;
};

/**
 * @returns {GameManager}
 */
GameManager.newInstance = function () {
    this._instance = new GameManager();
    return this._instance;
};