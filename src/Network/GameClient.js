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
        EzyLogger.debug = false;

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

        var streamingHandler = new EzyStreamingHandler();
        streamingHandler.handle = function (bytes) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function (e) {
                var buffer = new Uint8Array(e.target.result);  // arraybuffer object
                // cc.log("buffer", JSON.stringify(buffer))
                var buf = new flatbuffers.ByteBuffer(GameClient.removeHeaderAfterPassEzyFoxCheck(buffer));
                let packet = survival2d.flatbuffers.Packet.getRootAsPacket(buf);
                switch (packet.dataType()) {
                    case survival2d.flatbuffers.PacketData.PingResponse: {
                        let oldTime = GameClient.getInstance()._pingByteTime || 0;
                        let newTime = Date.now();
                        let pingTime = newTime - oldTime;
                        cc.log("pingByte", pingTime);
                        setTimeout(GameClient.getInstance().sendPingByte.bind(GameClient.getInstance()), 1000);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PingByPlayerMoveResponse: {
                        let oldTime = GameClient.getInstance()._pingByPlayerMoveByteTime || 0;
                        let newTime = Date.now();
                        let pingTime = newTime - oldTime;
                        cc.log("pingByPlayerMoveByte", pingTime);
                        setTimeout(GameClient.getInstance().sendPingByPlayerMoveByte.bind(GameClient.getInstance(), {
                            x: Math.sqrt(2),
                            y: Math.sqrt(2)
                        }, 1 / Math.sqrt(2)), 1000);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PingByMatchInfoResponse: {
                        let oldTime = GameClient.getInstance()._pingByMatchInfoByteTime || 0;
                        let newTime = Date.now();
                        let pingTime = newTime - oldTime;
                        cc.log("pingByMatchInfoByte", pingTime);
                        setTimeout(GameClient.getInstance().sendPingByMatchInfoByte.bind(GameClient.getInstance()), 1000);
                        break;
                    }
                    default:
                        cc.log("not handle", packet.dataType());
                }
            });
            reader.readAsArrayBuffer(bytes);
        }
        setup.setStreamingHandler(streamingHandler);

        cc.log("Start connect");
        this.client.connect("ws://127.0.0.1:2208/ws");
        // this.client.connect("wss://server.survival2d.app/ws");
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

        setupPlugin.addDataHandler(Cmd.PING_PONG, function (plugin, data) {
            GameManager.getInstance().receivedPong();
        });

        setupPlugin.addDataHandler(Cmd.GET_USER_INFO, function (plugin, data) {
            let pk = new ReceivedUserInfo(data);
            cc.log("RECEIVED GET_USER_INFO", JSON.stringify(pk));
            GameManager.getInstance().userData.setUserData(pk.username);
            SceneManager.getInstance().openHomeScene();

            // GameManager.getInstance().startPing();
            GameClient.getInstance().sendPingJson();
            GameClient.getInstance().sendPingByPlayerMoveJson({
                x: Math.sqrt(2),
                y: Math.sqrt(2)
            }, 1 / Math.sqrt(2));
            GameClient.getInstance().sendPingByMatchInfoJson();

            GameClient.getInstance().sendPingByte();
            GameClient.getInstance().sendPingByPlayerMoveByte({
                x: Math.sqrt(2),
                y: Math.sqrt(2)
            }, 1 / Math.sqrt(2));
            GameClient.getInstance().sendPingByMatchInfoByte();
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
            GameManager.getInstance().getCurrentMatch().updateMatchInfo(pk.players, pk.obstacles);
        });

        setupPlugin.addDataHandler(Cmd.PLAYER_MOVE, function (plugin, data) {
            let pk = new ReceivedPlayerMoveAction(data);
            GameManager.getInstance().getCurrentMatch().receivedPlayerMove(pk.username, pk.position, pk.rotation);
        });

        setupPlugin.addDataHandler(Cmd.PLAYER_ATTACK, function (plugin, data) {
            let pk = new ReceivedPlayerAttackAction(data);
            cc.log("RECEIVED PLAYER_ATTACK", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedPlayerAttack(pk.username, pk.weaponId, pk.position);
        });

        setupPlugin.addDataHandler(Cmd.CHANGE_WEAPON, function (plugin, data) {
            let pk = new ReceivedPlayerChangeWeapon(data);
            cc.log("RECEIVED CHANGE_WEAPON", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedPlayerChangeWeapon(pk.username, pk.slot);
        });

        setupPlugin.addDataHandler(Cmd.CREATE_BULLET, function (plugin, data) {
            let pk = new ReceivedCreateBullet(data);
            cc.log("RECEIVED CREATE_BULLET", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedCreateBullet(pk.bullet);
        });

        setupPlugin.addDataHandler(Cmd.PLAYER_TAKE_DAMAGE, function (plugin, data) {
            let pk = new ReceivedPlayerTakeDamage(data);
            cc.log("RECEIVED PLAYER_TAKE_DAMAGE", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedPlayerTakeDamage(pk.username, pk.hp);
        });

        setupPlugin.addDataHandler(Cmd.PLAYER_DEAD, function (plugin, data) {
            let pk = new ReceivedPlayerDead(data);
            cc.log("RECEIVED PLAYER_DEAD", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedPlayerDead(pk.username);
        });

        setupPlugin.addDataHandler(Cmd.OBSTACLE_TAKE_DAMAGE, function (plugin, data) {
            let pk = new ReceivedObstacleTakeDamage(data);
            cc.log("RECEIVED OBSTACLE_TAKE_DAMAGE", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedObstacleTakeDamage(pk.obstacleId, pk.hp);
        });

        setupPlugin.addDataHandler(Cmd.OBSTACLE_DESTROYED, function (plugin, data) {
            let pk = new ReceivedObstacleDestroyed(data);
            cc.log("RECEIVED OBSTACLE_DESTROYED", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedObstacleDestroyed(pk.obstacleId);
        });

        setupPlugin.addDataHandler(Cmd.CREATE_ITEM, function (plugin, data) {
            let pk = new ReceivedItemCreated(data);
            cc.log("RECEIVED CREATE_ITEM", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedItemCreated(pk.item);
        });

        setupPlugin.addDataHandler(Cmd.END_GAME, function (plugin, data) {
            let pk = new ReceivedMatchResult(data);
            cc.log("RECEIVED END_GAME", JSON.stringify(pk));
            GameManager.getInstance().getCurrentMatch().receivedMatchResult(pk.winTeam);
        });

        setupPlugin.addDataHandler(Cmd.PING, function (plugin, data) {
            let oldTime = GameClient.getInstance()._pingJsonTime || 0;
            let newTime = Date.now();
            let pingTime = newTime - oldTime;
            cc.log("pingJson", pingTime);
            setTimeout(GameClient.getInstance().sendPingJson.bind(GameClient.getInstance()), 1000);
        });

        setupPlugin.addDataHandler(Cmd.PING_BY_PLAYER_MOVE, function (plugin, data) {
            let oldTime = GameClient.getInstance()._pingByPlayerMoveJsonTime || 0;
            let newTime = Date.now();
            let pingTime = newTime - oldTime;
            cc.log("pingByPlayerMoveJson", pingTime);
            setTimeout(GameClient.getInstance().sendPingByPlayerMoveJson.bind(GameClient.getInstance(), {
                x: Math.sqrt(2),
                y: Math.sqrt(2)
            }, 1 / Math.sqrt(2)), 1000);
        });

        setupPlugin.addDataHandler(Cmd.PING_BY_MATCH_INFO, function (plugin, data) {
            let oldTime = GameClient.getInstance()._pingByMatchInfoJsonTime || 0;
            let newTime = Date.now();
            let pingTime = newTime - oldTime;
            cc.log("pingByMatchInfoJson", pingTime);
            setTimeout(GameClient.getInstance().sendPingByMatchInfoJson.bind(GameClient.getInstance()), 1000);
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
    },

    sendPlayerMove: function (direction, rotation) {
        // cc.log("sendPlayerMove");
        let builder = new flatbuffers.Builder(0);
        let directionOffset = survival2d.flatbuffers.Vec2.createVec2(builder, direction.x, direction.y);
        let requestOffset = survival2d.flatbuffers.PlayerMoveRequest.createPlayerMoveRequest(builder, directionOffset, rotation);
        let packetOffset = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerMoveRequest, requestOffset);
        builder.finish(packetOffset);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
        GameClient.getInstance()._pingTime = Date.now();
    },

    sendPingJson: function () {
        this._pingJsonTime = Date.now();
        let pk = new SendPing();
        this.sendPacket(pk);
    },

    sendPingByPlayerMoveJson: function (direction, rotation) {
        this._pingByPlayerMoveJsonTime = Date.now();
        let pk = new SendPingByPlayerMove(direction, rotation);
        this.sendPacket(pk);
    },

    sendPingByMatchInfoJson: function () {
        this._pingByMatchInfoJsonTime = Date.now();
        let pk = new SendPingByMatchInfo();
        this.sendPacket(pk);
    },

    sendPingByte: function () {
        this._pingByteTime = Date.now();
        let builder = new flatbuffers.Builder(0);
        let requestOffset = survival2d.flatbuffers.PingRequest.createPingRequest(builder);
        let packetOffset = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PingRequest, requestOffset);
        builder.finish(packetOffset);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    sendPingByPlayerMoveByte: function (direction, rotation) {
        this._pingByPlayerMoveByteTime = Date.now();
        let builder = new flatbuffers.Builder(0);
        let directionOffset = survival2d.flatbuffers.Vec2.createVec2(builder, direction.x, direction.y);
        let requestOffset = survival2d.flatbuffers.PingByPlayerMoveRequest.createPingByPlayerMoveRequest(builder, directionOffset, rotation);
        let packetOffset = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PingByPlayerMoveRequest, requestOffset);
        builder.finish(packetOffset);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    sendPingByMatchInfoByte: function () {
        this._pingByMatchInfoByteTime = Date.now();
        let builder = new flatbuffers.Builder(0);
        let requestOffset = survival2d.flatbuffers.PingByMatchInfoRequest.createPingByMatchInfoRequest(builder);
        let packetOffset = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PingByMatchInfoRequest, requestOffset);
        builder.finish(packetOffset);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
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

/*
 * EzyFox check isRawBytes bằng cách lấy byte đầu tiên của packet làm header rồi check (header & (1 << 4)) != 0
 */
GameClient.PACKET_PREFIX = Uint8Array.of(0b00010000);
GameClient.PACKET_PREFIX_LENGTH = GameClient.PACKET_PREFIX.length;
GameClient.createHeaderToPassEzyFoxCheck = function (data) {
    let dataToSend = new Uint8Array(data.length + GameClient.PACKET_PREFIX_LENGTH);
    dataToSend.set(GameClient.PACKET_PREFIX, 0);
    dataToSend.set(data, GameClient.PACKET_PREFIX_LENGTH);
    return dataToSend;
}
GameClient.removeHeaderAfterPassEzyFoxCheck = function (data) {
    return data.slice(GameClient.PACKET_PREFIX_LENGTH);
}
