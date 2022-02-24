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

        private  Awake()
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

        public void PlayMusic(AudioClip clip, bool loop = true)
        {
            StopMusic();
            musicChannel.clip = clip;
            musicChannel.loop = loop;
            musicChannel.Play();
        }

        public void StopMusic()
        {
            musicChannel.clip = null;
            musicChannel.Stop();
        }

        public void PlaySound(AudioClip clip)
        {
            if (clip == null || currentSoundClips.Contains(clip))
                return;

            soundChannel.PlayOneShot(clip);
            currentSoundClips.Add(clip);
            StartCoroutine(SoundCooldown(clip, CooldownForSounds));
            StartCoroutine(Dispose(clip, clip.length));
        }

        public IEnumerator SoundCooldown(AudioClip clip, float cooldown)
        {
            yield return new WaitForSecondsRealtime(cooldown);
            currentSoundClips.Remove(clip);
        }

        public IEnumerator Dispose(AudioClip clip, float cooldown)
        {
            yield return new WaitForSecondsRealtime(cooldown);
            playingSoundClips.Remove(clip);
        }

        #endregion
    }
}
