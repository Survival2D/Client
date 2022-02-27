class Timer {
    static readonly OneSecond: number = 1;

    private duration: number = 5;
    private autoStart: boolean = true;

    public onSecondElapsed: Function[] = [];
    public onTimerEnd: Function[] = [];

    public timeRemaining: number = 0;
    private timeout: number;

    private Awake() {
        this.timeRemaining = this.duration;
    }

    private Start() {
        if (this.autoStart)
            this.startTimer();
    }

    private secondElapsed() {
        if (this.timeRemaining == 0) {
            this.onTimerEnd.forEach(func => {
                func.call(this);
            });
            return;
        }

        this.timeRemaining--;
        this.onSecondElapsed.forEach(func => {
            func.call(this, this.timeRemaining);
        });
        this.startTimer();
    }

    public startTimer() {
        this.timeout = setTimeout(this.secondElapsed, Timer.OneSecond * 1000);
    }

    public pauseTimer() {
        clearTimeout(this.timeout);
    }

    public stopTimer() {
        this.timeRemaining = this.duration;
        clearTimeout(this.timeout);
    }

    public resetTimer() {
        this.timeRemaining = this.duration;
        clearTimeout(this.timeout);
        this.onSecondElapsed.forEach(func => {
            func.call(this, this.timeRemaining);
        });
    }

}
