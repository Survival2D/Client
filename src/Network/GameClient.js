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

    connectClientServer: function () {
        EzyLogger.debug = true;

        var handshakeHandler = new EzyHandshakeHandler();
        handshakeHandler.getLoginRequest = function (context) {
            return [ZONE_NAME, "Guest", "123456", []];
        };

        var userLoginHandler = new EzyLoginSuccessHandler();
        userLoginHandler.handleLoginSuccess = function () {
            var pluginInfoRequest = [PLUGIN_NAME];
            this.client.send(EzyCommand.PLUGIN_INFO, pluginInfoRequest);
        }.bind(this);

        var pluginInfoHandler = new EzyPluginInfoHandler();
        pluginInfoHandler.postHandle = function (plugin, data) {
            console.log("setup socket client completed");
            this.sendGetUserInfo();
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

        cc.log("Tien log o day");
        setInterval(() => {
            this.sendSpinRequest();
        }, 1000);
    },

    initListener: function () {
        var setupPlugin = this.client.setup.setupPlugin(PLUGIN_NAME);

        setupPlugin.addDataHandler("spin", function (plugin, data) {
            cc.log("RECEIVED spin", JSON.stringify(data));
            // prize = data.result;
            // playGame.prototype.spin();
        });

        setupPlugin.addDataHandler(Cmd.GET_USER_INFO, function (plugin, data) {
            cc.log("RECEIVED GET_USER_INFO", JSON.stringify(data));
            var pk = new ReceivedUserInfo(data);
            GameManager.getInstance().userData.setUserData(pk.username);
            SceneManager.getInstance().openHomeScene();
        });

        setupPlugin.addDataHandler(Cmd.FIND_MATCH, function (plugin, data) {
            cc.log("RECEIVED FIND_MATCH", JSON.stringify(data));
            var pk = new ReceivedFindMatch(data);
            GameManager.getInstance().onReceivedFindMatch(pk.result, pk.gameId);
        });

        setupPlugin.addDataHandler(Cmd.CREATE_TEAM, function (plugin, data) {
            cc.log("RECEIVED CREATE_TEAM", JSON.stringify(data));
            var pk = new ReceivedCreateTeam(data);
            GameManager.getInstance().onReceivedCreateTeam(0, pk.teamId);
        });

        setupPlugin.addDataHandler(Cmd.JOIN_TEAM, function (plugin, data) {
            cc.log("RECEIVED JOIN_TEAM", JSON.stringify(data));
            var pk = new ReceivedJoinTeam(data);
            GameManager.getInstance().onReceivedJoinTeam(pk.result, pk.teamId);
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

    sendSpinRequest: function () {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send("spin");
        }
    },

    sendGetUserInfo: function () {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send(Cmd.GET_USER_INFO);
        }
    },

    sendFindMatch: function () {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send(Cmd.FIND_MATCH);
        }
    },

    sendCreateTeam: function () {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send(Cmd.CREATE_TEAM);
        }
    },

    sendJoinTeam: function (teamId = -1) {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send(Cmd.JOIN_TEAM, {teamId: teamId});
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
