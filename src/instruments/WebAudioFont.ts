/* import { Instrument } from './Instrument';
import WebAudioFontPlayer from 'webaudiofont';

export class WebAudioFont extends Instrument {
    player;
    preset;
    midiOffset = 0;
    constructor(props: any) {
        super(props);
        this.player = new WebAudioFontPlayer(props.context);
        this.player.loader.instrumentInfo(0);
        this.cacheInstrument(props.preset);
    }

    cacheInstrument(n = 1) {
        var info = this.player.loader.instrumentInfo(n);
        if (window[info.variable]) {
            return;
        }
        this.player.loader.startLoad(this.context, info.url, info.variable);
        this.player.loader.waitLoad((preset) => {
            this.preset = window[info.variable];
        });
    }

    playKeys(keys: number[], settings: any = {}) {
        super.playKeys(keys, settings);
        // TODO: check out https://surikov.github.io/webaudiofont/examples/ahdsr.html
        if (keys.length === 1) {
            this.player.queueWaveTable(this.context, this.context.destination, this.preset,
                settings.deadline, keys[0], settings.duration/1000, settings.gain);
        } else {
            this.player.queueChord(this.context, this.context.destination, this.preset,
                settings.deadline, keys, settings.duration/1000, settings.gain);
        }
    }

} */