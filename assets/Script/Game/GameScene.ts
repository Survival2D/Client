// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Obstacle from "./Obstacle/Obstacle";
import Prefab = cc.Prefab;
import instantiate = cc.instantiate;
import Player from "./Player";
import { TestData } from "../Nakama/RPCData";
import NakamaManager from "../Nakama/NakamaManager";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import { Code } from "../Nakama/OperationCode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
  private isUp: boolean = false;
  private isDown: boolean = false;
  private isLeft: boolean = false;
  private isRight: boolean = false;

  @property
  vel: number = 200;

  @property(Prefab)
  private bushPrefab: Prefab = null;

  @property(Prefab)
  private playerPrefab: Prefab = null;

  @property(cc.Node)
  camera: cc.Node = null;

  @property(cc.Node)
  mainPlayer: cc.Node = null;

  private playersMap: Map<number, Player> = null;

  private obstacles: Obstacle[];
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.obstacles = [];
    this.playersMap = new Map<number, Player>();
    this.genObstacles(3);
  }

  start() {
    cc.log("number of obstacles", this.obstacles.length);
    for (let obs of this.obstacles) {
      obs.setPosition((Math.random() - 0.5) * 900, (Math.random() - 0.5) * 700);
    }

    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    this.camera.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
  }

  async onKeyDown(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
        this.isLeft = true;
        break;
      case cc.macro.KEY.s:
        this.isDown = true;
        break;
      case cc.macro.KEY.d:
        this.isRight = true;
        break;
      case cc.macro.KEY.w:
        this.isUp = true;
        break;
      case cc.macro.KEY.t:
        this.newPlayerJoin(123);
    }

    //TODO: demo gửi data
    let data: TestData = {
      id: 7777777,
      position: {
        x: this.mainPlayer.x,
        y: this.mainPlayer.y,
      },
      obj: {
        key1: "value1",
        key2: "value2",
      },
      str: "this is a string",
      userID: NakamaManager.instance.session.user_id,
    };
    // await NakamaManager.instance.socket.sendMatchState(
    //   MultiplayerManager.instance.matchId,
    //   Code.Test,
    //   data
    // );
    await MultiplayerManager.instance.send(Code.Test, data);
    // cc.log("Tien log o day!", data);
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
        this.isLeft = false;
        break;
      case cc.macro.KEY.s:
        this.isDown = false;
        break;
      case cc.macro.KEY.d:
        this.isRight = false;
        break;
      case cc.macro.KEY.w:
        this.isUp = false;
        break;
    }
  }

  onMouseMove(event) {
    let dx = event.getLocationX() - this.camera.width / 2;
    let dy = event.getLocationY() - this.camera.height / 2;
    let angle = (Math.atan(-dx / dy) * 180) / Math.PI;
    if (dy < 0) angle = 180 + angle;
    this.mainPlayer.angle = angle;
  }

  genObstacles(num?: number) {
    for (let i = 0; i < num; i++) {
      let node = instantiate(this.bushPrefab);
      this.node.addChild(node);
      this.obstacles.push(node.getComponent(Obstacle));
    }
  }

  newPlayerJoin(id: number) {
    if (this.playersMap.has(id)) return;
    let player = instantiate(this.playerPrefab);
    this.node.addChild(player);
    this.playersMap.set(id, player.getComponent(Player));
  }

  async updatePlayerPos(id: number, x: number, y?: number) {
    if (!this.playersMap.has(id)) return;
    this.playersMap.get(id).node.setPosition(x, y);
  }

  update(dt) {
    if (this.isLeft && this.isUp) {
      this.mainPlayer.x -= (this.vel / 1.4) * dt;
      this.mainPlayer.y += (this.vel / 1.4) * dt;
    } else if (this.isLeft && this.isDown) {
      this.mainPlayer.x -= (this.vel / 1.4) * dt;
      this.mainPlayer.y -= (this.vel / 1.4) * dt;
    } else if (this.isRight && this.isUp) {
      this.mainPlayer.x += (this.vel / 1.4) * dt;
      this.mainPlayer.y += (this.vel / 1.4) * dt;
    } else if (this.isRight && this.isDown) {
      this.mainPlayer.x += (this.vel / 1.4) * dt;
      this.mainPlayer.y -= (this.vel / 1.4) * dt;
    } else if (this.isLeft && this.isRight) {
    } else if (this.isUp && this.isDown) {
    } else if (this.isLeft) this.mainPlayer.x -= this.vel * dt;
    else if (this.isRight) this.mainPlayer.x += this.vel * dt;
    else if (this.isUp) this.mainPlayer.y += this.vel * dt;
    else if (this.isDown) this.mainPlayer.y -= this.vel * dt;

    // move camera following player
    this.camera.x = this.mainPlayer.x;
    this.camera.y = this.mainPlayer.y;

    // this.playersMap.forEach((e, key) => {
    //     this.updatePlayerPos(key, e.node.x + this.vel*dt, e.node.y);
    // })
  }

  onDestroy() {
    // Cancel keyboard input monitoring
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    this.camera.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
  }
}
