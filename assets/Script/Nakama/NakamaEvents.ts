class NakamaEvents {
    public onConnecting = null;
    public onConnected = null;
    public onDisconnected = null;
    public onLoginSuccess = null;
    public onLoginFail = null;

    private Start() {
        NakamaManager.Instance.onConnecting += OnConnecting;
        NakamaManager.Instance.onConnected += OnConnected;
        NakamaManager.Instance.onDisconnected += OnDisconnected;
        NakamaManager.Instance.onLoginSuccess += OnLoginSuccess;
        NakamaManager.Instance.onLoginFail += OnLoginFail;
    }

    private OnDestroy() {
        NakamaManager.Instance.onConnecting -= OnConnecting;
        NakamaManager.Instance.onConnected -= OnConnected;
        NakamaManager.Instance.onDisconnected -= OnDisconnected;
        NakamaManager.Instance.onLoginSuccess -= OnLoginSuccess;
        NakamaManager.Instance.onLoginFail -= OnLoginFail;
    }

    private OnConnecting() {
        this.onConnecting?.call();
    }

    private OnConnected() {
        this.onConnected?.call();
    }

    private OnDisconnected() {
        this.onDisconnected?.Invoke();
    }

    private OnLoginSuccess() {
        this.onLoginSuccess?.Invoke();
    }

    private OnLoginFail() {
        this.onLoginFail?.Invoke();
    }
}
