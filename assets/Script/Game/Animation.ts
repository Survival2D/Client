import Sprite = cc.Sprite;

class Animation {
    frames: Sprite[] = null;
    framesPerSecond: number = 12;
    loop: boolean = true;

    frame: number = 0;


    currentFrame(): number {
        return Math.floor(this.frame);
    }

    reset() {
        this.frame = 0;
    }

    getCurrentFrame(deltaTime: number): Sprite {
        this.frame += deltaTime * this.framesPerSecond;

        if (this.frame >= frames.length)
            this.frame = this.loop ? 0 : frames.length - 1;

        return this.frames[this.currentFrame()];
    }

    toJSON(): string {
        // TODO: JSON.stringify thuộc tính nhưng không method :D
        // return _.omit(this, [ "privateProperty1", "privateProperty2" ]);
        return "";
    };
}
