/**
 * Created by quantm7 on 8/7/2022.
 */

var LoginScene = BaseLayer.extend({
    ctor: function () {
        this._super(LoginScene.className);
        this.loadCss("LoginScene.json");
    },

    initGUI: function () {
        this.lblGameTitle = this.getControl("lblGameTitle");
        this.customButton("btnLogin", this.onLogin, this);
    },

    onEnter: function () {
        this._super();
    },

    onLogin: function () {
        GameClient.newInstance().connectClientServer();
    }
});

LoginScene.className = "LoginScene";

LoginScene.BTN_LOGIN = 1;