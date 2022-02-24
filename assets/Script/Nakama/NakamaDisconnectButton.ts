import Button = cc.Button;

class NakamaDisconnectButton {
    private button: Button = null;


    private awake() {
        this.button.onClick.AddListener(Disconect);
    }

    private onDestroy() {
        this.button.onClick.RemoveListener(Disconect);
    }

    private disconect() {
        NakamaManager.instance.logOut();
    }
}
