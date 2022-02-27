class NakamaDisconnectedChangeScene {
    private sceneName: string = null;
    isListening: boolean = false;

    ctor() {

    }


    private start() {
        NakamaManager.instance.onDisconnected += this.disconnected;
    }

    private onDestroy() {
        NakamaManager.instance.onDisconnected -= this.disconnected;
    }

    private disconnected() {
        SceneManager.loadScene(this.sceneName);
    }
}
