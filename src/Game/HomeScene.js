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
        this.customButton("btnJoinTeam", this.onJoinTeam, this);
        this.customButton("btnCreateTeam", this.onCreateTeam, this);
    },

    onEnter: function () {
        this._super();

        var userData = GameManager.getInstance().userData;
        this.lblName.setString(userData.username);
    },

    onFindMatch: function () {
        GameManager.getInstance().findMatch();
    },

    onJoinTeam: function () {
        GameManager.getInstance().joinTeam();
    },

    onCreateTeam: function () {
        GameManager.getInstance().createTeam();
    }
});

HomeScene.className = "HomeScene";