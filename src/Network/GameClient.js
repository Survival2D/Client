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
            setInterval(() => {
                GameClient.getInstance().sendFlatBuffers();
            }, 1000);
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

        setupPlugin.addDataHandler("flatbuffers", function (plugin, data) {
            var monster = MyGame.Sample.Monster.getRootAsMonster(data);
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

    sendFlatBuffers: function () {
        cc.log("send flatbuffers");
        var builder = new flatbuffers.Builder(0);

        // Create some weapons for our Monster ('Sword' and 'Axe').
        var weaponOne = builder.createString('Sword');
        var weaponTwo = builder.createString('Axe');

        MyGame.Sample.Weapon.startWeapon(builder);
        MyGame.Sample.Weapon.addName(builder, weaponOne);
        MyGame.Sample.Weapon.addDamage(builder, 3);
        var sword = MyGame.Sample.Weapon.endWeapon(builder);

        MyGame.Sample.Weapon.startWeapon(builder);
        MyGame.Sample.Weapon.addName(builder, weaponTwo);
        MyGame.Sample.Weapon.addDamage(builder, 5);
        var axe = MyGame.Sample.Weapon.endWeapon(builder);

        // Serialize the FlatBuffer data.
        var name = builder.createString('Orc');

        var treasure = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var inv = MyGame.Sample.Monster.createInventoryVector(builder, treasure);

        var weaps = [sword, axe];
        var weapons = MyGame.Sample.Monster.createWeaponsVector(builder, weaps);

        var pos = MyGame.Sample.Vec3.createVec3(builder, 1.0, 2.0, 3.0);

        MyGame.Sample.Monster.startMonster(builder);
        MyGame.Sample.Monster.addPos(builder, pos);
        MyGame.Sample.Monster.addHp(builder, 300);
        MyGame.Sample.Monster.addColor(builder, MyGame.Sample.Color.Red)
        MyGame.Sample.Monster.addName(builder, name);
        MyGame.Sample.Monster.addInventory(builder, inv);
        MyGame.Sample.Monster.addWeapons(builder, weapons);
        MyGame.Sample.Monster.addEquippedType(builder, MyGame.Sample.Equipment.Weapon);
        MyGame.Sample.Monster.addEquipped(builder, weaps[1]);
        var orc = MyGame.Sample.Monster.endMonster(builder);

        builder.finish(orc); // You may also call 'MyGame.Example.Monster.finishMonsterBuffer(builder, orc);'.

        // We now have a FlatBuffer that can be stored on disk or sent over a network.

        // ...Code to store to disk or send over a network goes here...

        // Instead, we are going to access it right away, as if we just received it.

        // var buf = builder.dataBuffer();


        let data = builder.asUint8Array();
        cc.log("begin send flatbuffers");
        cc.log(JSON.stringify(data));
        this.client.sendBytes(data);
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
