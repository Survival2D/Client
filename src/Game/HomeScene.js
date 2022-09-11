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
        this.lblName = this.getControl("lblName");
        this.customButton("btnFindMatch", this.onFindMatch, this);
        this.customButton("btnFindSquad", this.onFindSquad, this);
        this.customButton("btnCreateSquad", this.onCreateSquad, this);
    },

    onEnter: function () {
        this._super();
    },

    onFindMatch: function () {
        GameManager.getInstance().findMatch();
    },

    onFindSquad: function () {
        GameManager.getInstance().findSquad();
    },

    onCreateSquad: function () {
        GameManager.getInstance().createSquad();
    }
});

HomeScene.className = "HomeScene";