/**
 * Created by quantm7 on 11/19/2022.
 */

const ResultGUI = BaseLayer.extend({
    ctor: function () {
        this._playerUIs = [];
        this._super(ResultGUI.className);
        this.loadCss(game_UIs.RESULT_LAYER);
    },

    initGUI: function () {
        this.bg = this.getControl("pBg");

        this.title = this.getControl("title");

        this.lblResult = this.getControl("lblResult");
        this.lblResult.ignoreContentAdaptWithSize(true);

        this.pCenter = this.getControl("pCenter");

        this.lblTop1 = this.getControl("lblTop1", this.pCenter);

        this.btnBack = this.customButton("btnBack", this.onBack, this);
    },

    onEnter: function () {
        this._super();
        this.effectIn();
    },

    onBack: function () {
        SceneManager.getInstance().openHomeScene();
    },

    effectIn: function () {
        this.bg.setOpacity(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.fadeIn(0.35));

        this.title.setPosition(this.title.defaultPosition.x, this.title.defaultPosition.y + 200);
        this.title.stopAllActions();
        this.title.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.moveTo(0.5, this.title.defaultPosition).easing(cc.easeBackOut())
        ));

        this.lblResult.setOpacity(0);
        this.lblResult.setScale(0.3);
        this.lblResult.stopAllActions();
        this.lblResult.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.spawn(
                cc.fadeIn(0.25),
                cc.scaleTo(0.25, 1).easing(cc.easeBackOut())
            )
        ));

        this.pCenter.setOpacity(0);
        this.pCenter.stopAllActions();
        this.pCenter.runAction(cc.sequence(
            cc.delayTime(0.7),
            cc.fadeIn(0.3)
        ));

        this.btnBack.setPosition(this.btnBack.defaultPosition.x + 200, this.btnBack.defaultPosition.y);
        this.btnBack.stopAllActions();
        this.btnBack.runAction(cc.sequence(
            cc.delayTime(1.2),
            cc.moveTo(0.35, this.btnBack.defaultPosition).easing(cc.easeBackOut())
        ));
    },

    setResultInfo: function (winTeam) {
        let match = GameManager.getInstance().getCurrentMatch();

        let winPlayers = match.getPlayerListByTeam(winTeam);

        if (winTeam === match.myPlayer.team) {
            this.lblResult.setString("You are the winner!");
            this.lblResult.setTextColor(cc.color("#FFAA00"));
        }
        else {
            this.lblResult.setString("You lose...");
            this.lblResult.setTextColor(cc.color("#0623B8"));
        }

        for (let playerUI of this._playerUIs) {
            playerUI.removeFromParent(true);
        }
        this._playerUIs = [];

        for (let i = 0; i < winPlayers.length; i++) {
            let player = winPlayers[i];
            let playerUI = new PlayerUI();
            playerUI.unEquip();
            playerUI.setPlayerRotation(-90);
            playerUI.setPlayerUIInfo(player.playerName);
            playerUI.setPlayerColorByTeam(player.team);

            playerUI.setScale(2);

            this.pCenter.addChild(playerUI);
            playerUI.setPosition(this.pCenter.width/2 + (i + 1 - (winPlayers.length)/2) * 200, this.pCenter.height/2);

            playerUI.defaultPosition = playerUI.getPosition();

            this._playerUIs.push(playerUI);
        }

        this.lblTop1.setPosition(this.pCenter.width/2 + (-(winPlayers.length)/2) * 200, this.pCenter.height/2);
        this.lblTop1.defaultPosition = this.lblTop1.getPosition();

        let delayTime = 0;
        for (let playerUI of this._playerUIs) {
            playerUI.setPosition(playerUI.defaultPosition.x + cc.winSize.width, playerUI.defaultPosition.y);
            playerUI.stopAllActions();
            playerUI.runAction(cc.sequence(
                cc.delayTime(0.9 + delayTime),
                cc.moveTo(0.3, playerUI.defaultPosition).easing(cc.easeExponentialInOut())
            ));

            delayTime += 0.15;
        }

        this.lblTop1.setPosition(this.lblTop1.defaultPosition.x - cc.winSize.width, this.lblTop1.defaultPosition.y);
        this.lblTop1.stopAllActions();
        this.lblTop1.runAction(cc.sequence(
            cc.delayTime(1 + delayTime),
            cc.moveTo(0.3, this.lblTop1.defaultPosition).easing(cc.easeExponentialInOut())
        ));
    }
});

ResultGUI.className = "ResultGUI";
ResultGUI.ZORDER = 100;