const fbs = survival2d.flatbuffers;

const WsClient = cc.Class.extend({
  ctor: function (url) {
    this.url = url;
  }, connect: function (loginName) {
    cc.log("connect");
    this.ws = new WebSocket(this.url);
    const self = this;
    this.ws.onopen = function () {
      cc.log("connected to: " + self.url);
      let builder = new flatbuffers.Builder(0);
      // let name = builder.createString(
      //     "user_" + Math.floor(Math.random() * 1000));
      let name = builder.createString(loginName);
      let loginRequest = fbs.LoginRequest.createLoginRequest(builder, name);
      let request = fbs.Request.createRequest(builder,
          fbs.RequestUnion.LoginRequest, loginRequest);
      builder.finish(request);
      self.sendBinary(builder.asUint8Array());
    }
    this.ws.onmessage = function (event) {
      const data = event.data;
      if (typeof data == "string") {
        cc.log("typeof data is string: " + data);
      } else {
        self.handleBinaryMessage(data);
      }
    }
    this.ws.onclose = function () {
      cc.log("disconnected from: " + self.url);
    }
    this.ws.onerror = function (e) {
      cc.log("connect to: " + self.url + " error : " + JSON.stringify(e));
    }
  }, handleBinaryMessage: function (data) {
    const fileReader = new FileReader();
    fileReader.onloadend = function (event) {
      const buffer = new Uint8Array(event.target.result);
      const buf = new flatbuffers.ByteBuffer(buffer);
      const response = fbs.Response.getRootAsResponse(buf);

      if (response.error() !== fbs.ResponseErrorEnum.SUCCESS) {
        cc.log("Packet ", response.responseType(), " error ", response.error());
        return;
      }

      switch (response.responseType()) {
        case fbs.ResponseUnion.LoginResponse: {
          let loginResponse = new fbs.LoginResponse();
          response.response(loginResponse);
          cc.log("login as user ", loginResponse.userId(), " name ",
              loginResponse.userName());
          GameManager.getInstance().userData.setUserData(loginResponse.userId(), loginResponse.userName());
          SceneManager.getInstance().openHomeScene();

          GameManager.getInstance().startPing();
          break;
        }
        case fbs.ResponseUnion.FindMatchResponse: {
          let findMatchResponse = new fbs.FindMatchResponse();
          response.response(findMatchResponse);

          GameManager.getInstance().onReceivedFindMatch(findMatchResponse.matchId());
          break;
        }
        case fbs.ResponseUnion.CreateTeamResponse: {
          let createTeamResponse = new fbs.CreateTeamResponse();
          response.response(createTeamResponse);
          GameManager.getInstance().onReceivedCreateTeam(createTeamResponse.teamId());
          break;
        }
        case fbs.ResponseUnion.JoinTeamResponse: {
          let joinTeamResponse = new fbs.JoinTeamResponse();
          response.response(joinTeamResponse);
          GameManager.getInstance().onReceivedJoinTeam(joinTeamResponse.teamId());
          break;
        }
        case fbs.ResponseUnion.MatchInfoResponse: {
          let matchInfoResponse = new fbs.MatchInfoResponse();
          response.response(matchInfoResponse);
          cc.log("RECEIVED MatchInfo");

          let players = [];
          for (let i = 0; i < matchInfoResponse.playersLength(); i++) {
            let bfPlayer = matchInfoResponse.players(i);
            let player = new PlayerData();
            player.playerId = bfPlayer.playerId();
            cc.log("match info player name of " + player.playerId, bfPlayer.playerName());
            player.playerName = bfPlayer.playerName();
            player.position.x = bfPlayer.position().x();
            player.position.y = bfPlayer.position().y();
            player.rotation = bfPlayer.rotation();
            player.hp = Config.PLAYER_MAX_HP;
            player.team = bfPlayer.team();
            players.push(player);
          }

          let obstacles = [], items = [], bullets = [];
          for (let i = 0; i < matchInfoResponse.mapObjectsLength(); i++) {
            let bfObj = matchInfoResponse.mapObjects(i);
            let obj = new MapObjectData();
            switch (bfObj.dataType()) {
              case fbs.MapObjectUnion.TreeTable: {
                obj = new TreeData();
                obstacles.push(obj);
                break;
              }
              case fbs.MapObjectUnion.ContainerTable: {
                obj = new CrateData();
                obstacles.push(obj);
                break;
              }
              case fbs.MapObjectUnion.StoneTable: {
                obj = new StoneData();
                obstacles.push(obj);
                break;
              }
              case fbs.MapObjectUnion.WallTable: {
                obj = new WallData();
                obstacles.push(obj);
                break;
              }
              case fbs.MapObjectUnion.BulletTable: {
                obj = new BulletData();
                bullets.push(obj);

                let bfBullet = new fbs.BulletTable();
                bfObj.data(bfBullet);
                obj.id = bfBullet.id();
                obj.ownerId = bfBullet.owner();
                obj.bulletType = bfBullet.type();
                obj.position.x = bfBullet.position().x();
                obj.position.y = bfBullet.position().y();
                obj.rawPosition.x = bfBullet.rawPosition().x();
                obj.rawPosition.y = bfBullet.rawPosition().y();
                obj.direction.x = bfBullet.direction().x();
                obj.direction.y = bfBullet.direction().y();
                break;
              }
              case fbs.MapObjectUnion.BulletItemTable: {
                obj = new ItemBulletData();
                items.push(obj);

                let bfBullet = new fbs.BulletItemTable();
                bfObj.data(bfBullet);
                obj.setGunType(bfBullet.type());
                obj.setNumBullets(bfBullet.numBullet());
                break;
              }
              case fbs.MapObjectUnion.GunItemTable: {
                obj = new ItemGunData();
                items.push(obj);

                let bfGun = new fbs.GunItemTable();
                bfObj.data(bfGun);
                obj.setNumBullets(bfGun.numBullet());
                break;
              }
              case fbs.MapObjectUnion.VestItemTable: {
                obj = new ItemVestData();
                items.push(obj);

                let bfVest = new fbs.VestItemTable();
                bfObj.data(bfVest);
                switch (bfVest.type()) {
                  case fbs.VestTypeEnum.LEVEL_0:
                    obj.vest.level = 0;
                    break;
                  case fbs.VestTypeEnum.LEVEL_1:
                    obj.vest.level = 1;
                    break;
                  default:
                    obj.vest.level = 0;
                    break;
                }
                break;
              }
              case fbs.MapObjectUnion.HelmetItemTable: {
                obj = new ItemHelmetData();
                items.push(obj);

                let bfHelmet = new fbs.HelmetItemTable();
                bfObj.data(bfHelmet);
                switch (bfHelmet.type()) {
                  case fbs.HelmetTypeEnum.LEVEL_0:
                    obj.helmet.level = 0;
                    break;
                  case fbs.HelmetTypeEnum.LEVEL_1:
                    obj.helmet.level = 1;
                    break;
                  default:
                    obj.helmet.level = 0;
                    break;
                }
                break;
              }
              case fbs.MapObjectUnion.BandageItemTable: {
                obj = new ItemBandageData();
                items.push(obj);
                break;
              }
              case fbs.MapObjectUnion.MedKitItemTable: {
                obj = new ItemMedKitData();
                items.push(obj);
                break;
              }
            }

            obj.setObjectId(bfObj.id());
            obj.position.x = bfObj.position().x();
            obj.position.y = bfObj.position().y();
          }

          GameManager.getInstance().getCurrentMatch().updateMatchInfo(players, obstacles, items, bullets);
          break;
        }
        case fbs.ResponseUnion.PlayerInfoResponse: {
          let playerInfoResponse = new fbs.PlayerInfoResponse();
          response.response(playerInfoResponse);
          cc.log("RECEIVED MyPlayerInfo");
          let hp = playerInfoResponse.hp();

          /**
           * @type {GunData[]}
           */
          let guns = [];
          for (let i = 0; i < playerInfoResponse.weaponsLength(); i++) {
            let bfWeapon = playerInfoResponse.weapons(i);
            if (bfWeapon.dataType() === fbs.WeaponUnion.GunTable) {
              let gun = new GunData();
              let bfGun = new fbs.GunTable();
              bfWeapon.data(bfGun);
              gun.type = bfGun.type();
              gun.numBullets = bfGun.remainBullets();
              cc.log("gun type", gun.type, "num bullets", gun.numBullets)
              gun.setActive(true);
              guns.push(gun);
            }
          }

          let remainBullets = {};
          remainBullets[GunData.GUN_TYPE.PISTOL] = 0;
          remainBullets[GunData.GUN_TYPE.SHOTGUN] = 0;
          remainBullets[GunData.GUN_TYPE.SNIPER] = 0;
          for (let i = 0; i < playerInfoResponse.bulletsLength(); i++) {
            let bfBullet = playerInfoResponse.bullets(i);
            remainBullets[bfBullet.type()] = bfBullet.numBullet();
          }
          cc.log("remain bullets", JSON.stringify(remainBullets))

          GameManager.getInstance().getCurrentMatch().updateMyPlayerInfo(hp, guns, remainBullets);
          break;
        }
        case fbs.ResponseUnion.PlayerMoveResponse: {
          let playerMoveResponse = new fbs.PlayerMoveResponse();
          response.response(playerMoveResponse);
          // cc.log("RECEIVED PlayerMove");
          let playerId = playerMoveResponse.playerId();
          let position = gm.p(playerMoveResponse.position().x(), playerMoveResponse.position().y());
          let rotation = playerMoveResponse.rotation();

          GameManager.getInstance().getCurrentMatch().receivedPlayerMove(
              playerId, position, rotation);
          break;
        }
        case fbs.ResponseUnion.PlayerChangeWeaponResponse: {
          let playerChangeWeaponResponse = new fbs.PlayerChangeWeaponResponse();
          response.response(playerChangeWeaponResponse);
          cc.log("RECEIVED PlayerChangeWeapon");
          GameManager.getInstance().getCurrentMatch().receivedPlayerChangeWeapon(
              playerChangeWeaponResponse.playerId(), playerChangeWeaponResponse.slot());
          break;
        }
        case fbs.ResponseUnion.PlayerReloadWeaponResponse: {
          let playerReloadWeaponResponse = new fbs.PlayerReloadWeaponResponse();
          response.response(playerReloadWeaponResponse);
          cc.log("RECEIVED PlayerReloadWeapon");
          GameManager.getInstance().getCurrentMatch().receivedPlayerReloadWeapon(
              playerReloadWeaponResponse.gunType(), playerReloadWeaponResponse.remainBulletsInGun(), playerReloadWeaponResponse.remainBullets());
          break;
        }
        case fbs.ResponseUnion.PlayerAttackResponse: {
          let playerAttackResponse = new fbs.PlayerAttackResponse();
          response.response(playerAttackResponse);
          cc.log("RECEIVED PlayerAttack");

          let playerId = playerAttackResponse.playerId();
          let slot = playerAttackResponse.slot();
          let position = gm.p(playerAttackResponse.position().x(), playerAttackResponse.position().y());
          GameManager.getInstance().getCurrentMatch().receivedPlayerAttack(
              playerId, slot, position);
          break;
        }
        case fbs.ResponseUnion.PlayerTakeDamageResponse: {
          let playerTakeDamageResponse = new fbs.PlayerTakeDamageResponse();
          response.response(playerTakeDamageResponse);
          cc.log("RECEIVED PlayerTakeDamage");
          GameManager.getInstance().getCurrentMatch().receivedPlayerTakeDamage(
              playerTakeDamageResponse.playerId(), playerTakeDamageResponse.remainHp());
          break;
        }
        case fbs.ResponseUnion.PlayerDeadResponse: {
          let playerDeadResponse = new fbs.PlayerDeadResponse();
          response.response(playerDeadResponse);
          cc.log("RECEIVED PlayerDead");
          GameManager.getInstance().getCurrentMatch().receivedPlayerDead(
              playerDeadResponse.playerId());
          break;
        }
        case fbs.ResponseUnion.CreateBulletOnMapResponse: {
          let createBulletOnMapResponse = new fbs.CreateBulletOnMapResponse();
          response.response(createBulletOnMapResponse);
          cc.log("RECEIVED CreateBullet");

          let bfBullet = createBulletOnMapResponse.bullet();
          let bullet = new BulletData();
          bullet.id = bfBullet.id();
          bullet.ownerId = bfBullet.owner();
          bullet.bulletType = bfBullet.type();
          bullet.position.x = bfBullet.position().x();
          bullet.position.y = bfBullet.position().y();
          bullet.rawPosition.x = bfBullet.rawPosition().x();
          bullet.rawPosition.y = bfBullet.rawPosition().y();
          bullet.direction.x = bfBullet.direction().x();
          bullet.direction.y = bfBullet.direction().y();

          GameManager.getInstance().getCurrentMatch().receivedCreateBullet(
              bullet);
          break;
        }
        case fbs.ResponseUnion.CreateItemOnMapResponse: {
          let createItemOnMapResponse = new fbs.CreateItemOnMapResponse();
          response.response(createItemOnMapResponse);
          cc.log("RECEIVED CreateItem", createItemOnMapResponse.itemType());

          let item = new ItemData();
          switch (createItemOnMapResponse.itemType()) {
            case fbs.ItemUnion.BulletItemTable: {
              let bfBullet = new fbs.BulletItemTable();
              createItemOnMapResponse.item(bfBullet);
              item = new ItemBulletData();
              item.setGunType(bfBullet.type());
              item.setNumBullets(bfBullet.numBullet());
              break;
            }
            case fbs.ItemUnion.GunItemTable: {
              let bfGun = new fbs.GunItemTable();
              createItemOnMapResponse.item(bfGun);
              item = new ItemGunData();
              item.setNumBullets(bfGun.numBullet());
              break;
            }
            case fbs.ItemUnion.VestItemTable: {
              let bfVest = new fbs.VestItemTable();
              createItemOnMapResponse.item(bfVest);
              item = new ItemVestData();
              switch (bfVest.type()) {
                case fbs.VestTypeEnum.LEVEL_0:
                  item.vest.level = 0;
                  break;
                case fbs.VestTypeEnum.LEVEL_1:
                  item.vest.level = 1;
                  break;
                default:
                  item.vest.level = 0;
                  break;
              }
              break;
            }
            case fbs.ItemUnion.HelmetItemTable: {
              let bfHelmet = new fbs.HelmetItemTable();
              createItemOnMapResponse.item(bfHelmet);
              item = new ItemHelmetData();
              switch (bfHelmet.type()) {
                case fbs.HelmetTypeEnum.LEVEL_0:
                  item.helmet.level = 0;
                  break;
                case fbs.HelmetTypeEnum.LEVEL_1:
                  item.helmet.level = 1;
                  break;
                default:
                  item.helmet.level = 0;
                  break;
              }
              break;
            }
            case fbs.ItemUnion.BandageItemTable: {
              let bfBandage = new fbs.BandageItemTable();
              createItemOnMapResponse.item(bfBandage);
              item = new ItemBandageData();
              break;
            }
            case fbs.ItemUnion.MedKitItemTable: {
              let bfMedKit = new fbs.MedKitItemTable();
              createItemOnMapResponse.item(bfMedKit);
              item = new ItemMedKitData();
              break;
            }
          }
          item.setObjectId(createItemOnMapResponse.id());
          item.position.x = createItemOnMapResponse.position().x();
          item.position.y = createItemOnMapResponse.position().y();

          let fromPosition = gm.p(createItemOnMapResponse.rawPosition().x(),
              createItemOnMapResponse.rawPosition().y());

          GameManager.getInstance().getCurrentMatch().receivedItemCreated(item,
              fromPosition);
          break;
        }
        case fbs.ResponseUnion.ObstacleTakeDamageResponse: {
          let obstacleTakeDamageResponse = new fbs.ObstacleTakeDamageResponse();
          response.response(obstacleTakeDamageResponse);
          cc.log("RECEIVED ObstacleTakeDamage");
          GameManager.getInstance().getCurrentMatch().receivedObstacleTakeDamage(
              obstacleTakeDamageResponse.obstacleId(), obstacleTakeDamageResponse.remainHp());
          break;
        }
        case fbs.ResponseUnion.ObstacleDestroyResponse: {
          let obstacleDestroyResponse = new fbs.ObstacleDestroyResponse();
          response.response(obstacleDestroyResponse);
          cc.log("RECEIVED ObstacleDestroyed");
          GameManager.getInstance().getCurrentMatch().receivedObstacleDestroyed(
              obstacleDestroyResponse.obstacleId());
          break;
        }
        case fbs.ResponseUnion.PlayerTakeItemResponse: {
          let playerTakeItemResponse = new fbs.PlayerTakeItemResponse();
          response.response(playerTakeItemResponse);
          cc.log("RECEIVED PlayerTakeItem");
          GameManager.getInstance().getCurrentMatch().receivedPlayerTakeItem(
              playerTakeItemResponse.playerId(), playerTakeItemResponse.itemOnMapId());
          break;
        }
        case fbs.ResponseUnion.UseHealItemResponse: {
          let useHealItemResponse = new fbs.UseHealItemResponse();
          response.response(useHealItemResponse);
          cc.log("RECEIVED UseHealItemResponse");
          GameManager.getInstance().getCurrentMatch().receivedMyPlayerHealed(
              useHealItemResponse.remainHp(), useHealItemResponse.itemType(), useHealItemResponse.remainItem());
          break;
        }
        case fbs.ResponseUnion.EndGameResponse: {
          let endGameResponse = new fbs.EndGameResponse();
          response.response(endGameResponse);
          cc.log("RECEIVED EndGame");
          GameManager.getInstance().getCurrentMatch().receivedMatchResult(
              endGameResponse.winTeam());
          break;
        }
        case fbs.ResponseUnion.NewSafeZoneResponse: {
          let newSafeZoneResponse = new fbs.NewSafeZoneResponse();
          response.response(newSafeZoneResponse);
          cc.log("RECEIVED NewSafeZoneResponse");
          GameManager.getInstance().getCurrentMatch().receivedNewSafeZone(
              newSafeZoneResponse.safeZone().x(), newSafeZoneResponse.safeZone().y(),
              newSafeZoneResponse.safeZone().radius());
          break;
        }
        case fbs.ResponseUnion.SafeZoneMoveResponse: {
          let safeZoneMoveResponse = new fbs.SafeZoneMoveResponse();
          response.response(safeZoneMoveResponse);
          cc.log("RECEIVED SafeZoneMoveResponse", safeZoneMoveResponse.safeZone().x(), safeZoneMoveResponse.safeZone().y(), safeZoneMoveResponse.safeZone().radius())
          GameManager.getInstance().getCurrentMatch().receivedSafeZoneMove(
              safeZoneMoveResponse.safeZone().x(), safeZoneMoveResponse.safeZone().y(),
              safeZoneMoveResponse.safeZone().radius());
          break;
        }
        case fbs.ResponseUnion.SetAutoPlayResponse: {
          let setAutoPlayResponse = new fbs.SetAutoPlayResponse();
          response.response(setAutoPlayResponse);
          GameManager.getInstance().getCurrentMatch().receivedSetAutoPlay(setAutoPlayResponse.enable());
          break;
        }
        case fbs.ResponseUnion.PingResponse: {
          GameManager.getInstance().receivedPong();
          break;
        }
        default:
          cc.log("not handle", response.responseType());
          break;
      }
    };
    fileReader.readAsArrayBuffer(data);
  }, disconnect: function () {
    cc.log("disconnect from " + this.url);
    this.ws.close();
  }, destroy: function () {
    cc.log("destroy");
    this.disconnect();
  }, sendBinary: function (data) {
    // cc.log("sendBinary: " + data);
    this.ws.send(data);
  }, sendText: function (text) {
    cc.log("sendText: " + text);
    this.ws.send(text);
  }, sendData: function (data) {
    const json = JSON.stringify(data);
    this.sendText(json);
  }
});

const fbsClient = new WsClient("wss://server.survival2d.app/fbs");
// fbsClient.connect();

// const jsonClient = new WsClient("ws://localhost:1999/json");
// jsonClient.connect();
// jsonClient.sendText("hello world");
// jsonClient.disconnect();
