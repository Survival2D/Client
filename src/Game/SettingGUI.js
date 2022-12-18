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
        this.customButton("btnBack", this.onClose, this);
    },

    onEnter: function () {
        this._super();

        this.lblEnableSmooth.setString(Config.ENABLE_SMOOTH ? "Enabled" : "Disabled");
    },

    changeEnableSmooth: function () {
        Config.ENABLE_SMOOTH = !Config.ENABLE_SMOOTH;
        this.lblEnableSmooth.setString(Config.ENABLE_SMOOTH ? "Enabled" : "Disabled");
    }
});

SettingGUI.className = "SettingGUI";