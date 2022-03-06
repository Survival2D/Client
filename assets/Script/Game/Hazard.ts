import Vector2 = sp.spine.Vector2;
import Color = cc.Color;
import { eventHandler } from "../Utils/EventHandler";
import BattleManager from "./BattleManage";

class Hazard {
  private wasCreated: RollbackVar<boolean> = new RollbackVar<boolean>();
  private spriteRenderer: SpriteRenderer = null;
  private map: Map = null;

  public coordinates: Vector2 = new Vector2();

  awake() {
    this.spriteRenderer = GetComponent<SpriteRenderer>();
  }

  initialize(tick: number, coordinates: Vector2, color: Color, map: Map) {
    this.map = map;
    this.spriteRenderer.color = color;
    this.coordinates = coordinates;
    this.wasCreated.set(0, false);

    this.wasCreated.set(tick, true);
    eventHandler.on(BattleManager.OnRewind, this.rewind);
  }

  onDestroy() {
    eventHandler.off(BattleManager.OnRewind, this.rewind);
  }

  rewind(tick: number) {
    tick--;
    if (this.wasCreated.getLastValue(tick) == true) return;

    this.map.removeHazard(this);
    this.destroy(this.gameObject);
  }
}
