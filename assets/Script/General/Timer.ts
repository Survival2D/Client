class Timer {
    private readonly OneSecond: number = 1;

    private duration: number = 5;
    private autoStart: boolean = true;

    public onSecondElapsed: UnityEvent<int> = null;
    public onTimerEnd: UnityEvent = null;

    public timeRemaining: number = 0;

    private Awake() {
        this.timeRemaining = this.duration;
    }

    private Start() {
        if (this.autoStart)
            this.startTimer();
    }

    private secondElapsed() {
        if (this.timeRemaining == 0) {
            this.onTimerEnd?.Invoke();
            return;
        }

        this.timeRemaining--;
        this.onSecondElapsed?.Invoke(TimeRemaining);
        Invoke(nameof(SecondElapsed), this.OneSecond);
    }

    public startTimer() {
        Invoke(nameof(SecondElapsed), this.OneSecond);
    }

    public pauseTimer() {
        CancelInvoke(nameof(SecondElapsed));
    }

    public stopTimer() {
        TimeRemaining = duration;
        CancelInvoke(nameof(SecondElapsed));
    }

    public resetTimer() {
        this.timeRemaining = this.duration;
        CancelInvoke(nameof(SecondElapsed));
        Invoke(nameof(SecondElapsed), OneSecond);
    }

}
