import ccclass = cc._decorator.ccclass;

@ccclass
export default class MakeNodePersistent extends cc.Component {
  onLoad() {
    cc.game.addPersistRootNode(this.node);
  }
}
