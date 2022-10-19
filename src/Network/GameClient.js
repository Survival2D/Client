/**
 * Created by quantm7 on 9/8/2022.
 */

var ZONE_NAME = "survival2d";
var PLUGIN_NAME = "survival2d";

var GameClient = cc.Class.extend({
    ctor: function () {
        this.config = new EzyClientConfig;
        this.config.zoneName = ZONE_NAME;

        this.client = null;
    },

    connectClientServer: function (username, password) {
        EzyLogger.debug = true;

        var handshakeHandler = new EzyHandshakeHandler();
        handshakeHandler.getLoginRequest = function (context) {
            return [ZONE_NAME, username, password, []];
        };

        var userLoginHandler = new EzyLoginSuccessHandler();
        userLoginHandler.handleLoginSuccess = function () {
            var pluginInfoRequest = [PLUGIN_NAME];
            this.client.send(EzyCommand.PLUGIN_INFO, pluginInfoRequest);
        }.bind(this);

        var pluginInfoHandler = new EzyPluginInfoHandler();
        pluginInfoHandler.postHandle = function (plugin, data) {
            console.log("setup socket client completed");
            this.sendEmptyPacket(Cmd.GET_USER_INFO);
        }.bind(this);

        var disconnectionHandler = new EzyDisconnectionHandler();
        disconnectionHandler.preHandle = function (event) {
        };

        var clients = EzyClients.getInstance();
        this.client = clients.newDefaultClient(this.config);
        var setup = this.client.setup;
        setup.addEventHandler(EzyEventType.DISCONNECTION, disconnectionHandler);
        setup.addDataHandler(EzyCommand.HANDSHAKE, handshakeHandler);
        setup.addDataHandler(EzyCommand.LOGIN, userLoginHandler);
        setup.addDataHandler(EzyCommand.PLUGIN_INFO, pluginInfoHandler);

        this.initListener();

        cc.log("Start connect");
        this.client.connect("ws://127.0.0.1:2208/ws");
        cc.log("End connect");

        // cc.log("Tien log o day");
        // setInterval(() => {
        //     this.sendSpinRequest();
        // }, 1000);
    },

    initListener: function () {
        let setupPlugin = this.client.setup.setupPlugin(PLUGIN_NAME);

        setupPlugin.addDataHandler("spin", function (plugin, data) {
            cc.log("RECEIVED spin", JSON.stringify(data));
            // prize = data.result;
            // playGame.prototype.spin();
        });

        setupPlugin.addDataHandler(Cmd.GET_USER_INFO, function (plugin, data) {
            let pk = new ReceivedUserInfo(data);
            cc.log("RECEIVED GET_USER_INFO", JSON.stringify(pk));
            GameManager.getInstance().userData.setUserData(pk.username);
            SceneManager.getInstance().openHomeScene();
        });

        setupPlugin.addDataHandler(Cmd.FIND_MATCH, function (plugin, data) {
            let pk = new ReceivedFindMatch(data);
            cc.log("RECEIVED FIND_MATCH", JSON.stringify(pk));
            GameManager.getInstance().onReceivedFindMatch(pk.result, pk.gameId);
        });

        setupPlugin.addDataHandler(Cmd.CREATE_TEAM, function (plugin, data) {
            let pk = new ReceivedCreateTeam(data);
            cc.log("RECEIVED CREATE_TEAM", JSON.stringify(pk));
            GameManager.getInstance().onReceivedCreateTeam(ErrorCode.SUCCESS, pk.teamId);
        });

        setupPlugin.addDataHandler(Cmd.JOIN_TEAM, function (plugin, data) {
            let pk = new ReceivedJoinTeam(data);
            cc.log("RECEIVED JOIN_TEAM", JSON.stringify(pk));
            GameManager.getInstance().onReceivedJoinTeam(pk.result, pk.teamId);
        });

        setupPlugin.addDataHandler(Cmd.MATCH_INFO, function (plugin, data) {
            let pk = new ReceivedUpdateMatchInfo(data);
            cc.log("RECEIVED MATCH_INFO", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().updateMatchInfo(pk.players);
        });

        setupPlugin.addDataHandler(Cmd.PLAYER_MOVE, function (plugin, data) {
            let pk = new ReceivedPlayerMoveAction(data);
            cc.log("RECEIVED PLAYER_MOVE", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedPlayerMove(pk.username, pk.position, pk.rotation);
        });
    },

    /**
     * @param {OutPacket} pk
     */
    sendPacket: function (pk) {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send(pk.cmdId, pk.data);
        }
    },

    sendEmptyPacket: function (cmd) {
        let plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send(cmd);
        }
    },

    sendSpinRequest: function () {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send("spin");
        }
    }
});

/**
 * @returns {GameClient}
 */
GameClient.getInstance = function () {
    if (!this._instance) this._instance = new GameClient();
    return this._instance;
}

/**
 * @returns {GameClient}
 */
GameClient.newInstance = function () {
    this._instance = new GameClient();
    return this._instance;
}
