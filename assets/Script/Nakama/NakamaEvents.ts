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
        onConnecting?.Invoke();
    }

    private OnConnected() {
        onConnected?.Invoke();
    }

    private OnDisconnected() {
        onDisconnected?.Invoke();
    }

    private OnLoginSuccess() {
        onLoginSuccess?.Invoke();
    }

    private OnLoginFail() {
        onLoginFail?.Invoke();
    }
}
