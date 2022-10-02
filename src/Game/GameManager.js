/**
 * Created by quantm7 on 9/11/2022.
 */

const GameManager = cc.Class.extend({
    ctor: function () {
        this.userData = new UserData();
        this.match = null;
    },

    findMatch: function () {
        GameClient.getInstance().sendEmptyPacket(Cmd.FIND_MATCH);
    },

    joinTeam: function () {
        let pk = new SendJoinTeam(0);
        GameClient.getInstance().sendPacket(pk);
    },

    createTeam: function () {
        GameClient.getInstance().sendEmptyPacket(Cmd.CREATE_TEAM);
    },

    findMatchWithTeam: function () {

    },

    onReceivedFindMatch: function (error, gameId) {
        if (error === ErrorCode.SUCCESS) {
            this.match = new MatchManager();
            this.match.newMatch(gameId);
        }
    },

    onReceivedCreateTeam: function (error, teamId) {
        if (error === ErrorCode.SUCCESS) {
            SceneManager.getInstance().openLobbyScene();
        }
    },

    onReceivedJoinTeam: function (error, teamId) {
        if (error === ErrorCode.SUCCESS) {
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