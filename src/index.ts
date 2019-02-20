import Band from './Band';
import Pianist from './musicians/Pianist';
import Drummer from './musicians/Drummer';
import Bassist from './musicians/Bassist';
import { Instrument } from './instruments/Instrument';
import { Musician } from './musicians/Musician';
import { Synthesizer } from './instruments/Synthesizer';
import { Sampler } from './instruments/Sampler';
import { PlasticDrums } from './instruments/PlasticDrums';
import { Trio } from './Trio';
import * as util from './util/util';
import { Pulse } from './Pulse';
import { RealParser } from './sheet/RealParser';
import { MidiOut } from './instruments/MidiOut';
import Permutator from './musicians/Permutator';
import { Voicing } from './harmony/Voicing';
import { Permutation } from './util/Permutation';
/* import { WebAudioFont } from './instruments/WebAudioFont'; */

export {
    Trio,
    Band,
    Pianist,
    Bassist,
    Drummer,
    Instrument,
    Musician,
    Synthesizer,
    Sampler,
    /* WebAudioFont, */
    Permutator,
    MidiOut,
    PlasticDrums,
    Pulse,
    util,
    RealParser,
    Voicing,
    Permutation,
};