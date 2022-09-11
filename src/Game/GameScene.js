/**
 * Created by quantm7 on 9/10/2022.
 */

var GameScene = BaseLayer.extend({
    ctor: function () {
        this._super(GameScene.className);
        this.loadCss("GameScene.json");
        this.controller = new Controller();
        this.initKeyBoardController();
    },

    initGUI: function () {
        this.ground = this.getControl("ground");

        this.player = new PlayerUI();
        this.addChild(this.player);
        this.player.setPosition(cc.winSize.width/2, cc.winSize.height/2);
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

    onEnter: function () {
        this._super();
        this.ground.setContentSize(4000, 3000);

        this.scheduleUpdate();
    },

    onExit: function () {
        this.unscheduleUpdate();
        this._super();
    },

    onButtonRelease: function (btn, tag) {
        switch (tag) {

        }
    },

    update: function (dt) {
        var unitVector = this.controller.calculateMovementVector();
        var newPos = gm.calculatePosition(this.player.getPosition(), unitVector, Config.PLAYER_BASE_SPEED);
        this.player.setPosition(newPos);
    }
});

GameScene.className = "GameScene";