import Scene = cc.Scene;

class SceneChanger {

    private delay: number = 0;
    private scene: Scene;
    private timeout: number;


    public changeScene() {
        StartCoroutine(ChangeSceneCoroutine());
    }

    private IEnumerator

    ChangeSceneCoroutine() {
        this.timeout = setTimeout(() => {
            SceneManager.LoadScene(this.scene)
        }, this.delay * 1000);
    }


}
