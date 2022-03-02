class TimerText {

    private format: string = "{0} seconds remaining";
    private text: cc.Label = null;
    private timer: Timer = null;


    private start() {
        this.timer.onSecondElapsed.push(this.updateText);
        this.updateText(this.timer.timeRemaining);
    }

    private onDestroy() {
        let index: number = this.timer.onSecondElapsed.indexOf(this.updateText);
        if (index >= -1) {
            this.timer.onSecondElapsed.splice(index, 1);
        }
    }

    private updateText(seconds: number) {
        this.text.string = `${seconds}`;
    }

}
