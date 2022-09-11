/**
 * Created by quantm7 on 9/11/2022.
 */

var GameManager = cc.Class.extend({
    ctor: function () {

    },

    findMatch: function () {
        SceneManager.getInstance().openGameScene();
    },

    findSquad: function () {
        SceneManager.getInstance().openLobbyScene();
    },

    createSquad: function () {
        SceneManager.getInstance().openLobbyScene();
    },

    findMatchWithSquad: function () {
        SceneManager.getInstance().openGameScene();
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