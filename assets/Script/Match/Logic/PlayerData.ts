export class PlayerData {
    public name: string;
    public readonly id: string;
    public colorId: number = 0;

    private hp: number;
    private nBullets: number;

    private maxHp = 100;
    private maxBullets = 100;

    constructor (id?: string) {
        if (id !== undefined) this.id = id;

        this.hp = this.maxHp;
    }

    loadBullet () {
        this.nBullets = this.maxBullets;
    }

    fire () {
        this.nBullets--;
        if (this.nBullets <= 0) this.loadBullet();
        return true;
    }

    takeDamage (damage: number) {
        this.hp -= damage;
    }

    heal (hp: number) {
        this.hp += hp;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    setHp (hp: number) {
        if (hp < 0) this.hp = 0;
        this.hp = (hp > this.maxHp ? this.maxHp : hp);
    }

    isDead () {
        return this.hp <= 0;
    }

    getHpRatio (): number {
        return this.hp/this.maxHp;
    }
}