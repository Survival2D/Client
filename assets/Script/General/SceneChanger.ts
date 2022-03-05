import Scene = cc.Scene;
import ccclass = cc._decorator.ccclass;

@ccclass
export default class SceneChanger extends cc.Component {
  private delay: number = 0;
  private scene: Scene;
  private timeout: NodeJS.Timeout;

  public changeScene() {
    // StartCoroutine(this.changeSceneCoroutine());
  }

  private IEnumerator;

  changeSceneCoroutine() {
    this.timeout = setTimeout(() => {
      // SceneManager.LoadScene(this.scene)
    }, this.delay * 1000);
  }
}
