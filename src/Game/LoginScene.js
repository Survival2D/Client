/**
 * Created by quantm7 on 8/7/2022.
 */

var LoginScene = BaseLayer.extend({
    ctor: function () {
        this._super(LoginScene.className);
        this.loadCss(res.LOGIN_SCENE);
    },

    initGUI: function () {
        this.lblGameTitle = this.getControl("lblGameTitle");

        this.tfUsername = this.getControl("tfUsername");
        this.tfPassword = this.getControl("tfPassword");

        this.customButton("btnLogin", this.onLogin, this);
    },

    onEnter: function () {
        this._super();
    },

    onLogin: function () {
        var username = this.tfUsername.getString();
        var password = this.tfPassword.getString();
        cc.log("username: ", username);
        cc.log("password: ", password);
        if (!username) username = "";
        if (!password) password = "";
        GameClient.newInstance().connectClientServer(username, password);

        if (Config.IS_OFFLINE) GameManager.getInstance().onReceivedFindMatch(0, 1);
    }
});

LoginScene.className = "LoginScene";

LoginScene.BTN_LOGIN = 1;