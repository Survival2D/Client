/**
 * Created by quantm7 on 8/7/2022.
 */

var HomeScene = BaseLayer.extend({
    ctor: function () {
        this._super(HomeScene.className);
        this.loadCss("HomeScene.json");
    },

    initGUI: function () {
        this.lblGameTitle = this.getControl("lblGameTitle");
        this.lblName = this.getControl("lblPlayerName");
        this.customButton("btnFindMatch", HomeScene.BTN_FIND_MATCH);
    },

    onButtonRelease: function (btn, tag) {
        switch (tag) {
            case HomeScene.BTN_FIND_MATCH:
                break;
        }
    }
});

HomeScene.className = "HomeScene";

HomeScene.BTN_FIND_MATCH = 1;