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

        var userData = GameManager.getInstance().userData;
        this.lblName.setString(userData.username);
    },

    onFindMatch: function () {
        GameManager.getInstance().findMatch();
    },

    onFindSquad: function () {
        GameManager.getInstance().joinTeam();
    },

    onCreateSquad: function () {
        GameManager.getInstance().createTeam();
    }
});

HomeScene.className = "HomeScene";