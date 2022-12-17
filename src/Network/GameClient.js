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
                    case survival2d.flatbuffers.PacketData.MatchInfoResponse: {
                        let response = new survival2d.flatbuffers.MatchInfoResponse();
                        packet.data(response);
                        cc.log("RECEIVED MatchInfo");

                        let players = [];
                        for (let i = 0; i < response.playersLength(); i++) {
                            let bfPlayer = response.players(i);
                            let player = new PlayerData();
                            player.username = bfPlayer.username();
                            player.position.x = bfPlayer.position().x();
                            player.position.y = bfPlayer.position().y();
                            player.rotation = bfPlayer.rotation();
                            player.hp = Config.PLAYER_MAX_HP;
                            player.team = bfPlayer.team();
                            players.push(player);
                        }

                        let obstacles = [], items = [];
                        for (let i = 0; i < response.mapObjectsLength(); i++) {
                            let bfObj = response.mapObjects(i);
                            let obj = new MapObjectData();
                            switch (bfObj.dataType()) {
                                case survival2d.flatbuffers.MapObjectData.Tree: {
                                    obj = new TreeData();
                                    obstacles.push(obj);
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.Container: {
                                    obj = new CrateData();
                                    obstacles.push(obj);
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.BulletItem: {
                                    obj = new ItemBulletData();
                                    items.push(obj);

                                    let bfBullet = new survival2d.flatbuffers.BulletItem();
                                    bfObj.data(bfBullet);
                                    obj.setNumBullets(bfBullet.numBullet());
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.GunItem: {
                                    obj = new ItemGunData();
                                    items.push(obj);

                                    let bfGun = new survival2d.flatbuffers.GunItem();
                                    bfObj.data(bfGun);
                                    obj.setNumBullets(bfGun.numBullet());
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.VestItem: {
                                    obj = new ItemVestData();
                                    items.push(obj);

                                    let bfVest = new survival2d.flatbuffers.VestItem();
                                    bfObj.data(bfVest);
                                    switch (bfVest.type()) {
                                        case survival2d.flatbuffers.VestType.LEVEL_0:
                                            obj.vest.level = 0;
                                            break;
                                        case survival2d.flatbuffers.VestType.LEVEL_1:
                                            obj.vest.level = 1;
                                            break;
                                        default:
                                            obj.vest.level = 0;
                                            break;
                                    }
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.HelmetItem: {
                                    obj = new ItemHelmetData();
                                    items.push(obj);

                                    let bfHelmet = new survival2d.flatbuffers.HelmetItem();
                                    bfObj.data(bfHelmet);
                                    switch (bfHelmet.type()) {
                                        case survival2d.flatbuffers.HelmetType.LEVEL_0:
                                            obj.helmet.level = 0;
                                            break;
                                        case survival2d.flatbuffers.HelmetType.LEVEL_1:
                                            obj.helmet.level = 1;
                                            break;
                                        default:
                                            obj.helmet.level = 0;
                                            break;
                                    }
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.BandageItem: {
                                    obj = new ItemBandageData();
                                    items.push(obj);
                                    break;
                                }
                                case survival2d.flatbuffers.MapObjectData.MedKitItem: {
                                    obj = new ItemMedKitData();
                                    items.push(obj);
                                    break;
                                }
                            }

                            obj.setObjectId(bfObj.id());
                            obj.position.x = bfObj.position().x();
                            obj.position.y = bfObj.position().y();
                        }

                        GameManager.getInstance().getCurrentMatch().updateMatchInfo(players, obstacles, items);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerInfoResponse: {
                        let response = new survival2d.flatbuffers.PlayerInfoResponse();
                        packet.data(response);
                        cc.log("RECEIVED MyPlayerInfo");
                        let hp = response.hp();
                        let haveGun = false;
                        for (let i = 0; i < response.weaponLength(); i++) {
                            let bfWeapon = response.weapon(i);
                            if (bfWeapon.dataType() === survival2d.flatbuffers.WeaponData.Gun) {
                                let bfGun = new survival2d.flatbuffers.Gun();
                                bfWeapon.data(bfGun);
                                bfGun.type();
                                bfGun.remainBullets();
                                haveGun = true;
                            }
                        }

                        GameManager.getInstance().getCurrentMatch().updateMyPlayerInfo(hp);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerMoveResponse: {
                        let response = new survival2d.flatbuffers.PlayerMoveResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerMove");
                        let username = response.username();
                        let position = gm.p(response.position().x(), response.position().y());
                        let rotation = response.rotation();

                        GameManager.getInstance().getCurrentMatch().receivedPlayerMove(username, position, rotation);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerChangeWeaponResponse: {
                        let response = new survival2d.flatbuffers.PlayerChangeWeaponResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerChangeWeapon");
                        GameManager.getInstance().getCurrentMatch().receivedPlayerChangeWeapon(response.username(), response.slot());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerReloadWeaponResponse: {
                        let response = new survival2d.flatbuffers.PlayerReloadWeaponResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerReloadWeapon");
                        GameManager.getInstance().getCurrentMatch().receivedPlayerReloadWeapon(response.remainBulletsInGun(), response.remainBullets());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerAttackResponse: {
                        let response = new survival2d.flatbuffers.PlayerAttackResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerAttack");

                        let username = response.username();
                        let slot = response.slot();
                        let position = gm.p(response.position().x(), response.position().y());
                        GameManager.getInstance().getCurrentMatch().receivedPlayerAttack(username, slot, position);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerTakeDamageResponse: {
                        let response = new survival2d.flatbuffers.PlayerTakeDamageResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerTakeDamage");
                        GameManager.getInstance().getCurrentMatch().receivedPlayerTakeDamage(response.username(), response.remainHp());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerDeadResponse: {
                        let response = new survival2d.flatbuffers.PlayerDeadResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerDead");
                        GameManager.getInstance().getCurrentMatch().receivedPlayerDead(response.username());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.CreateBulletOnMapResponse: {
                        let response = new survival2d.flatbuffers.CreateBulletOnMapResponse();
                        packet.data(response);
                        cc.log("RECEIVED CreateBullet");

                        let bfBullet = response.bullet();
                        let bullet = new BulletData();
                        bullet.id = bfBullet.id();
                        bullet.ownerId = bfBullet.owner();
                        bullet.bulletType = bfBullet.type();
                        bullet.position.x = bfBullet.position().x();
                        bullet.position.y = bfBullet.position().y();
                        bullet.rawPosition = bullet.position;
                        bullet.direction.x = bfBullet.direction().x();
                        bullet.direction.y = bfBullet.direction().y();

                        GameManager.getInstance().getCurrentMatch().receivedCreateBullet(bullet);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.CreateItemOnMapResponse: {
                        let response = new survival2d.flatbuffers.CreateItemOnMapResponse();
                        packet.data(response);
                        cc.log("RECEIVED CreateItem");

                        let item = new ItemData();
                        switch (response.itemType()) {
                            case survival2d.flatbuffers.Item.BulletItem: {
                                let bfBullet = new survival2d.flatbuffers.BulletItem();
                                response.item(bfBullet);
                                item = new ItemBulletData();
                                item.setNumBullets(bfBullet.numBullet());
                                break;
                            }
                            case survival2d.flatbuffers.Item.GunItem: {
                                let bfGun = new survival2d.flatbuffers.GunItem();
                                response.item(bfGun);
                                item = new ItemGunData();
                                item.setNumBullets(bfGun.numBullet());
                                break;
                            }
                            case survival2d.flatbuffers.Item.VestItem: {
                                let bfVest = new survival2d.flatbuffers.VestItem();
                                response.item(bfVest);
                                item = new ItemVestData();
                                switch (bfVest.type()) {
                                    case survival2d.flatbuffers.VestType.LEVEL_0:
                                        item.vest.level = 0;
                                        break;
                                    case survival2d.flatbuffers.VestType.LEVEL_1:
                                        item.vest.level = 1;
                                        break;
                                    default:
                                        item.vest.level = 0;
                                        break;
                                }
                                break;
                            }
                            case survival2d.flatbuffers.Item.HelmetItem: {
                                let bfHelmet = new survival2d.flatbuffers.HelmetItem();
                                response.item(bfHelmet);
                                item = new ItemHelmetData();
                                switch (bfHelmet.type()) {
                                    case survival2d.flatbuffers.HelmetType.LEVEL_0:
                                        item.helmet.level = 0;
                                        break;
                                    case survival2d.flatbuffers.HelmetType.LEVEL_1:
                                        item.helmet.level = 1;
                                        break;
                                    default:
                                        item.helmet.level = 0;
                                        break;
                                }
                                break;
                            }
                            case survival2d.flatbuffers.Item.BandageItem: {
                                let bfBandage = new survival2d.flatbuffers.BandageItem();
                                response.item(bfBandage);
                                item = new ItemBandageData();
                                break;
                            }
                            case survival2d.flatbuffers.Item.MedKitItem: {
                                let bfMedKit = new survival2d.flatbuffers.MedKitItem();
                                response.item(bfMedKit);
                                item = new ItemMedKitData();
                                break;
                            }
                        }
                        item.setObjectId(response.id());
                        item.position.x = response.position().x();
                        item.position.y = response.position().y();

                        let fromPosition = gm.p(response.rawPosition().x(), response.rawPosition().y());

                        GameManager.getInstance().getCurrentMatch().receivedItemCreated(item, fromPosition);
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.ObstacleTakeDamageResponse: {
                        let response = new survival2d.flatbuffers.ObstacleTakeDamageResponse();
                        packet.data(response);
                        cc.log("RECEIVED ObstacleTakeDamage");
                        GameManager.getInstance().getCurrentMatch().receivedObstacleTakeDamage(response.id(), response.remainHp());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.ObstacleDestroyResponse: {
                        let response = new survival2d.flatbuffers.ObstacleDestroyResponse();
                        packet.data(response);
                        cc.log("RECEIVED ObstacleDestroyed");
                        GameManager.getInstance().getCurrentMatch().receivedObstacleDestroyed(response.id());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.PlayerTakeItemResponse: {
                        let response = new survival2d.flatbuffers.PlayerTakeItemResponse();
                        packet.data(response);
                        cc.log("RECEIVED PlayerTakeItem");
                        GameManager.getInstance().getCurrentMatch().receivedPlayerTakeItem(response.username(), response.id());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.UseHealItemResponse: {
                        let response = new survival2d.flatbuffers.UseHealItemResponse();
                        packet.data(response);
                        cc.log("RECEIVED UseHealItemResponse");
                        GameManager.getInstance().getCurrentMatch().receivedMyPlayerHealed(response.remainHp(), response.itemType(), response.remainItem());
                        break;
                    }
                    case survival2d.flatbuffers.PacketData.EndGameResponse: {
                        let response = new survival2d.flatbuffers.EndGameResponse();
                        packet.data(response);
                        cc.log("RECEIVED EndGame");
                        GameManager.getInstance().getCurrentMatch().receivedMatchResult(response.winTeam());
                        break;
                    }
                    default:
                        cc.log("not handle", packet.dataType());
                        break;
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

            GameManager.getInstance().startPing();
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
            // setTimeout(GameClient.getInstance().sendPingByPlayerMove.bind(GameClient.getInstance(), {x:111111111.111111111, y:111111111.111111111}, 111111111.111111111), 1000);
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

    sendGetMatchInfo: function () {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.MatchInfoRequest.createMatchInfoRequest(builder);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.MatchInfoRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
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
        this._pingTime = Date.now();
    },

    sendPlayerAttack: function () {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.PlayerAttackRequest.createPlayerAttackRequest(builder);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerAttackRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    /**
     * @param {number} slot
     */
    sendPlayerChangeWeapon: function (slot) {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.PlayerChangeWeaponRequest.createPlayerChangeWeaponRequest(builder, slot);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerChangeWeaponRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    sendPlayerReloadWeapon: function () {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.PlayerReloadWeaponRequest.createPlayerReloadWeaponRequest(builder);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerReloadWeaponRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    sendPlayerTakeItem: function () {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.PlayerTakeItemRequest.createPlayerTakeItemRequest(builder);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerTakeItemRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    sendPlayerUseBandage: function () {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.UseHealItemRequest.createUseHealItemRequest(builder, survival2d.flatbuffers.Item.BandageItem);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerTakeItemRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
    },

    sendPlayerUseMedKit: function () {
        let builder = new flatbuffers.Builder(0);
        let offset = survival2d.flatbuffers.UseHealItemRequest.createUseHealItemRequest(builder, survival2d.flatbuffers.Item.MedKitItem);
        let packet = survival2d.flatbuffers.Packet.createPacket(builder, survival2d.flatbuffers.PacketData.PlayerTakeItemRequest, offset);
        builder.finish(packet);
        let data = GameClient.createHeaderToPassEzyFoxCheck(builder.asUint8Array());
        this.client.sendBytes(data);
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
if (!Constant.TEST) {
    GameClient.PACKET_PREFIX = Uint8Array.of(0b00010000);
    GameClient.PACKET_PREFIX_LENGTH = GameClient.PACKET_PREFIX.length;
}
GameClient.createHeaderToPassEzyFoxCheck = function (data) {
    let dataToSend = new Uint8Array(data.length + GameClient.PACKET_PREFIX_LENGTH);
    dataToSend.set(GameClient.PACKET_PREFIX, 0);
    dataToSend.set(data, GameClient.PACKET_PREFIX_LENGTH);
    return dataToSend;
}
GameClient.removeHeaderAfterPassEzyFoxCheck = function (data) {
    return data.slice(GameClient.PACKET_PREFIX_LENGTH);
}
