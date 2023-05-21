const fbs = survival2d.flatbuffers;

const WsClient = cc.Class.extend({
  ctor: function (url) {
    this.url = url;
  },
  connect: function () {
    cc.log("connect");
    this.ws = new WebSocket(this.url);
    const self = this;
    this.ws.onopen = function () {
      cc.log("connected to: " + self.url);
      let builder = new flatbuffers.Builder(0);
      let offset = fbs.LoginRequest.createLoginRequest(builder);
      let packet = fbs.Response.createResponse(builder, fbs.RequestUnion.LoginRequest, offset);
      builder.finish(packet);
      self.sendBinary(builder.asUint8Array());
    }
    this.ws.onmessage = function (event) {
      cc.log("onmessage: ", JSON.stringify(event))
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
  },
  handleBinaryMessage: function (data) {
    cc.log("rawData", JSON.stringify(data))
    const fileReader = new FileReader();
    fileReader.onloadend = function(event) {
      const buffer = new Uint8Array(event.target.result);
      const buf = new flatbuffers.ByteBuffer(buffer);
      const responseData = fbs.Response.getRootAsResponse(buf);

      switch (responseData.responseType()) {
        case fbs.ResponseUnion.LoginResponse: {
          let response = new fbs.LoginResponse();
          responseData.response(response);
          cc.log("login as user ", response.playerId())
          break;
        }
        case fbs.ResponseUnion.MatchInfoResponse: {
          let response = new fbs.MatchInfoResponse();
          response.data(responseData);
          cc.log("RECEIVED MatchInfo");

          let players = [];
          for (let i = 0; i < response.playersLength(); i++) {
            let bfPlayer = response.players(i);
            let player = new PlayerData();
            player.username = bfPlayer.playerId();
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
              case fbs.MapObjectUnion.BulletItemTable: {
                obj = new ItemBulletData();
                items.push(obj);

                let bfBullet = new fbs.BulletItemTable();
                bfObj.data(bfBullet);
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

          GameManager.getInstance().getCurrentMatch().updateMatchInfo(players, obstacles, items);
          break;
        }
        case fbs.ResponseUnion.PlayerInfoResponse: {
          let response = new fbs.PlayerInfoResponse();
          response.data(response);
          cc.log("RECEIVED MyPlayerInfo");
          let hp = response.hp();
          let haveGun = false;
          for (let i = 0; i < response.weaponLength(); i++) {
            let bfWeapon = response.weapon(i);
            if (bfWeapon.dataType() === fbs.WeaponUnion.GunTable) {
              let bfGun = new fbs.GunTable();
              bfWeapon.data(bfGun);
              bfGun.type();
              bfGun.remainBullets();
              haveGun = true;
            }
          }

          GameManager.getInstance().getCurrentMatch().updateMyPlayerInfo(hp, haveGun);
          break;
        }
        case fbs.ResponseUnion.PlayerMoveResponse: {
          let response = new fbs.PlayerMoveResponse();
          response.data(response);
          cc.log("RECEIVED PlayerMove");
          let username = response.username();
          let position = gm.p(response.position().x(), response.position().y());
          let rotation = response.rotation();

          GameManager.getInstance().getCurrentMatch().receivedPlayerMove(username, position, rotation);
          break;
        }
        case fbs.ResponseUnion.PlayerChangeWeaponResponse: {
          let response = new fbs.PlayerChangeWeaponResponse();
          response.data(response);
          cc.log("RECEIVED PlayerChangeWeapon");
          GameManager.getInstance().getCurrentMatch().receivedPlayerChangeWeapon(response.username(), response.slot());
          break;
        }
        case fbs.ResponseUnion.PlayerReloadWeaponResponse: {
          let response = new fbs.PlayerReloadWeaponResponse();
          response.data(response);
          cc.log("RECEIVED PlayerReloadWeapon");
          GameManager.getInstance().getCurrentMatch().receivedPlayerReloadWeapon(response.remainBulletsInGun(), response.remainBullets());
          break;
        }
        case fbs.ResponseUnion.PlayerAttackResponse: {
          let response = new fbs.PlayerAttackResponse();
          response.data(response);
          cc.log("RECEIVED PlayerAttack");

          let username = response.username();
          let slot = response.slot();
          let position = gm.p(response.position().x(), response.position().y());
          GameManager.getInstance().getCurrentMatch().receivedPlayerAttack(username, slot, position);
          break;
        }
        case fbs.ResponseUnion.PlayerTakeDamageResponse: {
          let response = new fbs.PlayerTakeDamageResponse();
          response.data(response);
          cc.log("RECEIVED PlayerTakeDamage");
          GameManager.getInstance().getCurrentMatch().receivedPlayerTakeDamage(response.username(), response.remainHp());
          break;
        }
        case fbs.ResponseUnion.PlayerDeadResponse: {
          let response = new fbs.PlayerDeadResponse();
          response.data(response);
          cc.log("RECEIVED PlayerDead");
          GameManager.getInstance().getCurrentMatch().receivedPlayerDead(response.username());
          break;
        }
        case fbs.ResponseUnion.CreateBulletOnMapResponse: {
          let response = new fbs.CreateBulletOnMapResponse();
          response.data(response);
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
        case fbs.ResponseUnion.CreateItemOnMapResponse: {
          let response = new fbs.CreateItemOnMapResponse();
          response.data(response);
          cc.log("RECEIVED CreateItem", response.itemType());

          let item = new ItemData();
          switch (response.itemType()) {
            case fbs.Item.BulletItemTable: {
              let bfBullet = new fbs.BulletItemTable();
              response.item(bfBullet);
              item = new ItemBulletData();
              item.setNumBullets(bfBullet.numBullet());
              break;
            }
            case fbs.Item.GunItemTable: {
              let bfGun = new fbs.GunItemTable();
              response.item(bfGun);
              item = new ItemGunData();
              item.setNumBullets(bfGun.numBullet());
              break;
            }
            case fbs.Item.VestItemTable: {
              let bfVest = new fbs.VestItemTable();
              response.item(bfVest);
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
            case fbs.Item.HelmetItemTable: {
              let bfHelmet = new fbs.HelmetItemTable();
              response.item(bfHelmet);
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
            case fbs.Item.BandageItemTable: {
              let bfBandage = new fbs.BandageItemTable();
              response.item(bfBandage);
              item = new ItemBandageData();
              break;
            }
            case fbs.Item.MedKitItemTable: {
              let bfMedKit = new fbs.MedKitItemTable();
              response.item(bfMedKit);
              item = new ItemMedKitData();
              break;
            }
            case fbs.Item.BackPackItemTable: {
              return;
            }
          }
          item.setObjectId(response.id());
          item.position.x = response.position().x();
          item.position.y = response.position().y();

          let fromPosition = gm.p(response.rawPosition().x(), response.rawPosition().y());

          GameManager.getInstance().getCurrentMatch().receivedItemCreated(item, fromPosition);
          break;
        }
        case fbs.ResponseUnion.ObstacleTakeDamageResponse: {
          let response = new fbs.ObstacleTakeDamageResponse();
          response.data(response);
          cc.log("RECEIVED ObstacleTakeDamage");
          GameManager.getInstance().getCurrentMatch().receivedObstacleTakeDamage(response.id(), response.remainHp());
          break;
        }
        case fbs.ResponseUnion.ObstacleDestroyResponse: {
          let response = new fbs.ObstacleDestroyResponse();
          response.data(response);
          cc.log("RECEIVED ObstacleDestroyed");
          GameManager.getInstance().getCurrentMatch().receivedObstacleDestroyed(response.id());
          break;
        }
        case fbs.ResponseUnion.PlayerTakeItemResponse: {
          let response = new fbs.PlayerTakeItemResponse();
          response.data(response);
          cc.log("RECEIVED PlayerTakeItem");
          GameManager.getInstance().getCurrentMatch().receivedPlayerTakeItem(response.username(), response.id());
          break;
        }
        case fbs.ResponseUnion.UseHealItemResponse: {
          let response = new fbs.UseHealItemResponse();
          response.data(response);
          cc.log("RECEIVED UseHealItemResponse");
          GameManager.getInstance().getCurrentMatch().receivedMyPlayerHealed(response.remainHp(), response.itemType(), response.remainItem());
          break;
        }
        case fbs.ResponseUnion.EndGameResponse: {
          let response = new fbs.EndGameResponse();
          response.data(response);
          cc.log("RECEIVED EndGame");
          GameManager.getInstance().getCurrentMatch().receivedMatchResult(response.winTeam());
          break;
        }
        case fbs.ResponseUnion.NewSafeZoneResponse: {
          let response = new fbs.NewSafeZoneResponse();
          response.data(response);
          cc.log("RECEIVED NewSafeZoneResponse");
          GameManager.getInstance().getCurrentMatch().receivedNewSafeZone(response.safeZone().x(), response.safeZone().y(), response.radius());
          break;
        }
        case fbs.ResponseUnion.SafeZoneMoveResponse: {
          let response = new fbs.SafeZoneMoveResponse();
          response.data(response);
          cc.log("RECEIVED SafeZoneMoveResponse");
          GameManager.getInstance().getCurrentMatch().receivedSafeZoneMove(response.safeZone().x(), response.safeZone().y(), response.radius());
          break;
        }
        default:
          cc.log("not handle", responseData.responseType());
          break;
      }
    };
    fileReader.readAsArrayBuffer(data);
  },
  disconnect: function () {
    cc.log("disconnect from " + this.url);
    this.ws.close();
  },
  destroy: function () {
    cc.log("destroy");
    this.disconnect();
  },
  sendBinary: function (data) {
    cc.log("sendBinary: " + data);
    this.ws.send(data);
  },
  sendText: function (text) {
    cc.log("sendText: " + text);
    this.ws.send(text);
  },
  sendData: function (data) {
    const json = JSON.stringify(data);
    this.sendText(json);
  }
});

const fbsClient = new WsClient("ws://localhost:1999/fbs");
// fbsClient.connect();

// const jsonClient = new WsClient("ws://localhost:1999/json");
// jsonClient.connect();
// jsonClient.sendText("hello world");
// jsonClient.disconnect();
