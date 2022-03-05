import AudioSource = cc.AudioSource;
import AudioClip = cc.AudioClip;
import ccclass = cc._decorator.ccclass;

@ccclass
export default class AudioManager extends cc.Component {
  private readonly CooldownForSounds: number = 0.05;
  public static readonly MusicVolume: number = 0.65;
  public static readonly SoundVolume: number = 1;

  private musicChannel: AudioSource = null;
  private musicChannelCrossFadeHelper: AudioSource = null;
  private soundChannel: AudioSource = null;
  private currentSoundClips: AudioClip[] = [];
  private playingSoundClips: AudioClip[] = [];

  public static instance: AudioManager = null;

  awake() {
    AudioManager.instance = this;
    // this.musicChannel = gameObject.AddComponent<AudioSource>();
    // this.musicChannelCrossFadeHelper = gameObject.AddComponent<AudioSource>();
    // this.soundChannel = gameObject.AddComponent<AudioSource>();
    this.loadVolume();
  }

  private loadVolume() {
    this.musicChannel.volume = AudioManager.MusicVolume;
    this.soundChannel.volume = AudioManager.SoundVolume;
  }

  public playMusic(clip: AudioClip, loop: boolean = true) {
    this.stopMusic();
    this.musicChannel.clip = clip;
    this.musicChannel.loop = loop;
    this.musicChannel.play();
  }

  public stopMusic() {
    this.musicChannel.clip = null;
    this.musicChannel.stop();
  }

  public playSound(clip: AudioClip) {
    if (clip == null || this.currentSoundClips.indexOf(clip) > -1) return;

    // this.soundChannel.play(clip);
    // currentSoundClips.Add(clip);
    // StartCoroutine(SoundCooldown(clip, CooldownForSounds));
    // StartCoroutine(Dispose(clip, clip.length));
  }

  public soundCooldown(
    clip: AudioClip,
    cooldown: number //:IEnumerator
  ) {
    // yield return new WaitForSecondsRealtime(cooldown);
    // currentSoundClips.Remove(clip);
  }

  public dispose(
    clip: AudioClip,
    cooldown: number //:IEnumerator
  ) {
    // yield return new WaitForSecondsRealtime(cooldown);
    // playingSoundClips.Remove(clip);
  }
}
