/**
 * Created by quantm7 on 9/10/2022.
 */

var GameScene = BaseLayer.extend({
    ctor: function () {
        this._super(GameScene.className);
        this.loadCss("GameScene.json");
        this.controller = new Controller();
        this.initKeyBoardController();
        this.initMouseController();
    },

    initGUI: function () {
        this.ground = this.getControl("ground");

        this.myPlayer = new PlayerUI();
        this.addChild(this.myPlayer);
        this.myPlayer.setPosition(cc.winSize.width/2, cc.winSize.height/2);
        var userData = GameManager.getInstance().userData;
        this.myPlayer.setPlayerUIInfo(userData.username);
    },

    initKeyBoardController: function () {
        var that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                that.controller.onKeyPressed(keyCode);
            },
            onKeyReleased: function(keyCode, event){
                that.controller.onKeyReleased(keyCode);
            }
        }, this);
    },

    initMouseController: function () {
        var that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: function (event) {
                that.controller.onMouseDown(event.getLocationX(), event.getLocationY());
            },
            onMouseUp: function (event) {
                that.controller.onMouseUp(event.getLocationX(), event.getLocationY());
            },
            onMouseMove: function (event) {
                that.controller.onMouseMove(event.getLocationX(), event.getLocationY());
            },
            onMouseScroll: function (event) {
                that.controller.onMouseScroll();
            },
        }, this);
    },

    onEnter: function () {
        this._super();
        this.ground.setContentSize(4000, 3000);

        this.scheduleUpdate();
    },

    onExit: function () {
        this.unscheduleUpdate();
        this._super();
    },

    updateMatchView: function () {
        let match = GameManager.getInstance().getCurrentMatch();
        if (!match) return;
        this.playerUIs = [];
        for (let player of match.players) {
            let playerUI = new PlayerUI();
            this.addChild(playerUI);
            playerUI.setPosition(cc.winSize.width/2, cc.winSize.height/2);
            playerUI.setPlayerUIInfo(player.username);
            this.playerUIs.push(playerUI);
        }
    },

    update: function (dt) {
        var unitVector = this.controller.calculateMovementVector();
        var newPos = gm.calculatePosition(this.myPlayer.getPosition(), unitVector, Config.PLAYER_BASE_SPEED);
        this.myPlayer.setPosition(newPos);

        var deg = gm.radToDeg(this.controller.calculateRotation(this.myPlayer.getPosition()));
        this.myPlayer.setPlayerRotation(deg);

        GameClient.getInstance().sendPlayerMoveAction(newPos, deg);
    }
});

GameScene.className = "GameScene";