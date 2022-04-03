export class PlayerData {
    public name: string;
    public id: string;
    public colorId: number = 0;

    private hp: number;
    private nBullets: number;

    private maxHp = 100;
    private maxBullets = 100;

    constructor (id?: string, name?: string) {
        this.id = id;
        this.name = name;

        this.hp = this.maxHp;
    }

    loadBullet () {
        this.nBullets = this.maxBullets;
    }

    heal (hp: number) {
        this.hp += hp;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    fire () {
        this.nBullets--;
        if (this.nBullets <= 0) this.loadBullet();
        return true;
    }

    takeDamage (damage: number) {
        this.hp -= damage;
    }

    isDead () {
        return this.hp <= 0;
    }

    getHpRatio () {
        return this.hp/this.maxHp;
    }
}