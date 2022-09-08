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
            SceneManager.getInstance().openHomeScene();
        };

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
    },

    sendSpinRequest: function () {
        var plugin = this.client.getPlugin();
        if (plugin != null) {
            plugin.send("spin");
        }
    }
});

GameClient.getInstance = function () {
    if (!this._instance) this._instance = new GameClient();
    return this._instance;
}

GameClient.newInstance = function () {
    this._instance = new GameClient();
    return this._instance;
}
