/**
 * Created by quantm7 on 12/14/2022.
 */

const SettingGUI = BaseLayer.extend({
    ctor: function () {
        this._super(SettingGUI.className);
        this.loadCss(game_UIs.SETTING_LAYER);
    },

    initGUI: function () {
        let pOption = this.getControl("option");

        this.lblEnableSmooth = this.customTextLabel("lblEnableSmooth", pOption);
        this.customButton("btnChangeSmooth", this.changeEnableSmooth, this);

        this.lblEnableAutoPlay = this.customTextLabel("lblEnableAutoPlay", pOption);
        this.customButton("btnChangeAutoPlay", this.changeAutoPlay, this);

        this.customButton("btnBack", this.onClose, this);
    },

    onEnter: function () {
        this._super();

        this.lblEnableSmooth.setString(Config.ENABLE_SMOOTH ? "Enabled" : "Disabled");
        this.lblEnableAutoPlay.setString(Config.ENABLE_AUTO_PLAY ? "Enabled" : "Disabled");
    },

    changeEnableSmooth: function () {
        Config.ENABLE_SMOOTH = !Config.ENABLE_SMOOTH;
        this.lblEnableSmooth.setString(Config.ENABLE_SMOOTH ? "Enabled" : "Disabled");
    },

    changeAutoPlay: function () {
        Config.ENABLE_AUTO_PLAY = !Config.ENABLE_AUTO_PLAY;
        this.lblEnableAutoPlay.setString(Config.ENABLE_AUTO_PLAY ? "Enabled" : "Disabled");

        GameClient.getInstance().sendAutoPlay(Config.ENABLE_AUTO_PLAY);
    }
});

SettingGUI.className = "SettingGUI";