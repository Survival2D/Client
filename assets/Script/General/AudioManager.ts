import AudioSource = cc.AudioSource;
import AudioClip = cc.AudioClip;

class AudioManager
    {

        private readonly CooldownForSounds:number = 0.05;
        public readonly MusicVolume:number = 0.65;
        public readonly SoundVolume:number = 1;

        private  musicChannel:AudioSource = null;
        private  musicChannelCrossFadeHelper:AudioSource = null;
        private  soundChannel:AudioSource= null;
        private  currentSoundClips:AudioClip[] = [];
        private  playingSoundClips:AudioClip[]  = [];

        public static instance:AudioManager = null;

        private  awake()
        {
            AudioManager.instance = this;
            this.musicChannel = gameObject.AddComponent<AudioSource>();
            this.musicChannelCrossFadeHelper = gameObject.AddComponent<AudioSource>();
            this.soundChannel = gameObject.AddComponent<AudioSource>();
            this.loadVolume();
        }

        private loadVolume()
        {
            this.musicChannel.volume = MusicVolume;
            this.soundChannel.volume = SoundVolume;
        }

        public  playMusic( clip:AudioClip,  loop:boolean = true)
        {
            this.stopMusic();
            this.musicChannel.clip = clip;
            this.musicChannel.loop = loop;
            this.musicChannel.play();
        }

        public stopMusic()
        {
            this.musicChannel.clip = null;
            this.musicChannel.stop();
        }

        public  playSound( clip:AudioClip)
        {
            if (clip == null || this.currentSoundClips.indexOf(clip)> -1)
                return;

            this.soundChannel.play(clip);
            currentSoundClips.Add(clip);
            StartCoroutine(SoundCooldown(clip, CooldownForSounds));
            StartCoroutine(Dispose(clip, clip.length));
        }

        public IEnumerator soundCooldown(AudioClip clip, float cooldown)
        {
            yield return new WaitForSecondsRealtime(cooldown);
            currentSoundClips.Remove(clip);
        }

        public IEnumerator dispose(AudioClip clip, float cooldown)
        {
            yield return new WaitForSecondsRealtime(cooldown);
            playingSoundClips.Remove(clip);
        }


}
