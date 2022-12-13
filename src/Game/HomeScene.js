/**
 * Created by quantm7 on 8/7/2022.
 */

var HomeScene = BaseLayer.extend({
    ctor: function () {
        this._super(HomeScene.className);
        this.loadCss(game_UIs.HOME_SCENE);
    },

    initGUI: function () {
        this.lblGameTitle = this.getControl("lblGameTitle");

        this.customButton("btnFindMatch", this.onFindMatch, this);
        this.customButton("btnJoinTeam", this.onJoinTeam, this);
        this.customButton("btnCreateTeam", this.onCreateTeam, this);
        this.customButton("btnSetting", this.onSetting, this);

        let pInfo = this.getControl("pInfo");
        this.lblName = this.customTextLabel("lblName", pInfo);

        let playerUI = new PlayerUI();
        playerUI.unEquip();
        playerUI.setPlayerRotation(-90);
        playerUI.setPlayerUIInfo(GameManager.getInstance().userData.username);
        playerUI.setPlayerColorByTeam(0);
        playerUI.setVestLevel(0);
        playerUI.setHelmetLevel(0);
        playerUI.setMyPlayer(true);

        playerUI.setScale(1.4);

        pInfo.addChild(playerUI);
        playerUI.setPosition(this.getControl("avaPos", pInfo).getPosition());

        playerUI.defaultPosition = playerUI.getPosition();
    },

    onEnter: function () {
        this._super();

        let userData = GameManager.getInstance().userData;
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
    },

    onSetting: function () {
        let gui = SceneManager.getInstance().getGUIByClassName(SettingGUI.className);
        if (gui) {
            gui.onClose();
        }
        else {
            let gui = new SettingGUI();
            SceneManager.getInstance().openGUI(gui, ResultGUI.ZORDER);
        }
    }
});

HomeScene.className = "HomeScene";