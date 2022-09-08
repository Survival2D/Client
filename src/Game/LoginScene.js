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
        this.customButton("btnLogin", LoginScene.BTN_LOGIN);
    },

    onEnter: function () {
        this._super();
    },

    onButtonRelease: function (btn, tag) {
        switch (tag) {
            case LoginScene.BTN_LOGIN:
                GameClient.newInstance().connectClientServer();
                break;
        }
    }
});

LoginScene.className = "LoginScene";

LoginScene.BTN_LOGIN = 1;