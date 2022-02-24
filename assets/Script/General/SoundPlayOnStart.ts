class SoundPlayOnStart {


    private sound: AudioClip = null;


    private Start() {
        AudioManager.instance.PlaySound(sound);
    }
}
