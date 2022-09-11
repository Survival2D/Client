/**
 * Created by quantm7 on 8/7/2022.
 */

var SceneManager = cc.Class.extend({
    ctor: function () {

    },

    getRunningScene: function () {
        var currentScene = cc.director.getRunningScene();
        if (currentScene instanceof cc.TransitionScene) {
            currentScene = cc.director.getRunningScene().getInScene();
        }
        return currentScene;
    },

    getMainLayer: function () {
        var curScene = this.getRunningScene();
        if (curScene === undefined || curScene === null) return null;
        return curScene.getChildByTag(SceneManager.MAIN_LAYER_TAG);
    },

    checkMainLayer: function (layer) {
        return (this.getMainLayer() instanceof layer);
    },

    openLoginScene: function () {
        var scene = new cc.Scene();
        var layer = new LoginScene();
        scene.addChild(layer);
        layer.setTag(SceneManager.MAIN_LAYER_TAG);

        cc.director.runScene(scene);
        return layer;
    },

    openHomeScene: function () {
        var scene = new cc.Scene();
        var layer = new HomeScene();
        scene.addChild(layer);
        layer.setTag(SceneManager.MAIN_LAYER_TAG);

        cc.director.runScene(scene);
        return layer;
    },

    openLobbyScene: function () {
        var scene = new cc.Scene();
        var layer = new LobbyScene();
        scene.addChild(layer);
        layer.setTag(SceneManager.MAIN_LAYER_TAG);

        cc.director.runScene(scene);
        return layer;
    },

    openGameScene: function () {
        var scene = new cc.Scene();
        var layer = new GameScene();
        scene.addChild(layer);
        layer.setTag(SceneManager.MAIN_LAYER_TAG);

        cc.director.runScene(scene);
        return layer;
    }
});

SceneManager.MAIN_LAYER_TAG = 101;

SceneManager.getInstance = function () {
    if (!this._instance) this._instance = new SceneManager();
    return this._instance;
}