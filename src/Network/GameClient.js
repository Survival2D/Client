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
            reader.addEventListener("loadend", function(e)
            {
                var buffer = new Uint8Array(e.target.result);  // arraybuffer object
                // cc.log("buffer", JSON.stringify(buffer))
                var buf = new flatbuffers.ByteBuffer(GameClient.removeHeaderAfterPassEzyFoxCheck(buffer));
                let packet = survival2d.flatbuffers.Packet.getRootAsPacket(buf);
                switch (packet.dataType()) {
                    case survival2d.flatbuffers.PacketData.PlayerMoveResponse:
                        let playerMoveResponse = new survival2d.flatbuffers.PlayerMoveResponse();
                        packet.data(playerMoveResponse);
                        // cc.log("playerMoveResponse", playerMoveResponse.id());
                        // cc.log("playerMoveResponse", playerMoveResponse.position().x());
                        // cc.log("playerMoveResponse", playerMoveResponse.position().y());
                        // cc.log("playerMoveResponse", playerMoveResponse.rotation());
                        let oldTime = GameClient.getInstance()._pingTime || 0;
                        let newTime = Date.now();
                        let pingTime = newTime - oldTime;
                        cc.log("Ping by player move flatbuffers", pingTime);
                        setTimeout(GameClient.getInstance().sendPlayerMove.bind(GameClient.getInstance(), {x:0, y:0}, 0), 1000);
                        break;
                    default:
                        cc.log("not handle", packet.dataType());
                }
            });
            reader.readAsArrayBuffer(bytes);
        }
        setup.setStreamingHandler(streamingHandler);

        cc.log("Start connect");
        // this.client.connect("ws://127.0.0.1:2208/ws");
        this.client.connect("wss://server.survival2d.app/ws");
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

            GameManager.getInstance().startPing();
            GameClient.getInstance().sendPingByPlayerMove({x:0, y:0}, 0);
            GameClient.getInstance().sendPlayerMove({x:0, y:0}, 0);
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

        setupPlugin.addDataHandler(Cmd.PING_BY_PLAYER_MOVE, function (plugin, data) {
            let pk = new ReceivedPingByPlayerMove(data);
            let oldTime = GameClient.getInstance()._pingByPlayerMoveTime || 0;
            let newTime = Date.now();
            let pingTime = newTime - oldTime;
            cc.log("Ping by player move json:", pingTime);
            setTimeout(GameClient.getInstance().sendPingByPlayerMove.bind(GameClient.getInstance(), {x:0, y:0}, 0), 1000);
        });

        setupPlugin.addDataHandler("flatbuffers", function (plugin, data) {
            var monster = survival2d.flatbuffers.Monster.getRootAsMonster(data);
            cc.log("get flatbuffers data");
            cc.log(JSON.stringify(monster));
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
        let data =  GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
        GameClient.getInstance()._pingTime = Date.now();
    },

    sendPingByPlayerMove: function (direction, rotation) {
        // cc.log("sendPingByPlayerMove");
        let pk = new SendPingByPlayerMove(direction, rotation);
        this.sendPacket(pk);
        this._pingByPlayerMoveTime = Date.now();
    },

    sendFlatBuffers: function () {
        cc.log("send flatbuffers");
        var builder = new flatbuffers.Builder(0);

        // Create some weapons for our Monster ('Sword' and 'Axe').
        var weaponOne = builder.createString('Sword');
        var weaponTwo = builder.createString('Axe');

        survival2d.flatbuffers.Weapon.startWeapon(builder);
        survival2d.flatbuffers.Weapon.addName(builder, weaponOne);
        survival2d.flatbuffers.Weapon.addDamage(builder, 3);
        var sword = survival2d.flatbuffers.Weapon.endWeapon(builder);

        survival2d.flatbuffers.Weapon.startWeapon(builder);
        survival2d.flatbuffers.Weapon.addName(builder, weaponTwo);
        survival2d.flatbuffers.Weapon.addDamage(builder, 5);
        var axe = survival2d.flatbuffers.Weapon.endWeapon(builder);

        // Serialize the FlatBuffer data.
        var name = builder.createString('Orc');

        var treasure = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var inv = survival2d.flatbuffers.Monster.createInventoryVector(builder, treasure);

        var weaps = [sword, axe];
        var weapons = survival2d.flatbuffers.Monster.createWeaponsVector(builder, weaps);

        var pos = survival2d.flatbuffers.Vec3.createVec3(builder, 1.0, 2.0, 3.0);

        survival2d.flatbuffers.Monster.startMonster(builder);
        survival2d.flatbuffers.Monster.addPos(builder, pos);
        survival2d.flatbuffers.Monster.addHp(builder, 300);
        survival2d.flatbuffers.Monster.addColor(builder, survival2d.flatbuffers.Color.Red)
        survival2d.flatbuffers.Monster.addName(builder, name);
        survival2d.flatbuffers.Monster.addInventory(builder, inv);
        survival2d.flatbuffers.Monster.addWeapons(builder, weapons);
        survival2d.flatbuffers.Monster.addEquippedType(builder, survival2d.flatbuffers.Equipment.Weapon);
        survival2d.flatbuffers.Monster.addEquipped(builder, weaps[1]);
        survival2d.flatbuffers.Monster.addEquipped(builder, weaps[1]);
        survival2d.flatbuffers.Monster.addTime(builder, new Date().getTime());
        var orc = survival2d.flatbuffers.Monster.endMonster(builder);

        builder.finish(orc); // You may also call 'MyGame.Example.Monster.finishMonsterBuffer(builder, orc);'.

        // We now have a FlatBuffer that can be stored on disk or sent over a network.

        // ...Code to store to disk or send over a network goes here...

        // Instead, we are going to access it right away, as if we just received it.

        // var buf = builder.dataBuffer();


        let data = builder.asUint8Array();
        let dataToSend = GameClient.createHeaderToPassEzyFoxCheck(data);
        cc.log("begin send flatbuffers");
        // cc.log("send", JSON.stringify(dataToSend));
        this.client.sendBytes(dataToSend);
        cc.log("end send flatbuffers");
        // cc.log(JSON.stringify(buf));
        // plugin.send("flatbuffers", buf);
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
