# Music Hacking Resources

## General Links

- [WAA Link Collection](https://github.com/alemangui/web-audio-resources)

## Notation

- [abc](http://abcnotation.com/)
  - [ABCjs](https://abcjs.net/#what)
  - [abc2xml](http://abc2xml.appspot.com)
  - [mehr](http://abcnotation.com/software)
- [MML](https://en.wikipedia.org/wiki/Music_Macro_Language)
- [Impro-Visor .ls format](https://www.cs.hmc.edu/~keller/jazz/improvisor/LeadsheetNotation.pdf)
  - [Many files](https://github.com/Impro-Visor/Impro-Visor/tree/master/leadsheets)
  - see Imaginary Book
  - ls format parser for jazzband ?
- [musicJSON](https://github.com/soundio/music-json)
- [musicXML](https://www.musicxml.com/de/software/)
  - [midi](https://www.musicxml.com/tutorial/the-midi-compatible-part/)
- [Plaine & Easy](https://www.iaml.info/plaine-easie-code)
- [MEI](https://music-encoding.org/)

## Music Data Sources

[Large MIDI collection]( https://www.reddit.com/r/WeAreTheMusicMakers/comments/3ajwe4/the_largest_midi_collection_on_the_internet/)

### Sheets

- [Impro-Visor Leadsheets](https://github.com/Impro-Visor/Impro-Visor/tree/master/leadsheets)
- [iRB Jazz Corpus](https://csml.som.ohio-state.edu/home/index.php/iRb_Jazz_Corpus)
- [ireal forums](https://irealb.com/forums/)
- [openbook](https://github.com/veltzer/openbook) (formatable realbook)
- [musicXML test files](https://www.verovio.org/musicxml.html)

### Scales

[Lateef Scales](https://www.amazon.com/Repository-Scales-Melodic-Patterns-Lateef/dp/B000O9TN46)

### Linked Data

- [linked jazz](https://linkedjazz.org/api/)
  - [tutorial on linked data visualization](https://www.youtube.com/watch?v=qAVGpb8KMpk)
  - [open refine](http://openrefine.org/) [docs](https://github.com/OpenRefine/OpenRefine/wiki/Documentation-For-Users)

## Visualization / UI / Rendering

[A curated list about Audio Visualization](https://github.com/willianjusten/awesome-audio-visualization)

### UI Components

- [NexusJs](https://nexus-js.github.io/ui/)
- [Tonejs/ui](https://github.com/Tonejs/ui)
  - [used in examples section](https://tonejs.github.io/examples/oscillator.html)
- [web components (+ piano)](https://github.com/g200kg/webaudio-controls)

### Piano Rolls

- https://github.com/g200kg/webaudio-pianoroll
- https://github.com/googlecreativelab/chrome-music-lab/tree/master/pianoroll

### Sheet Rendering / Engraving

- [Opensheetmusicdisplay](https://opensheetmusicdisplay.org/) (musixXML>vexflow)
  - [xml to json](https://www.npmjs.com/package/xml-js)
- [ABCjs](https://abcjs.net/#what)
- [concerto](https://github.com/panarch/concerto)
- [vexflow](http://www.vexflow.com/)
  - [React Native + Vexflow](https://github.com/panarch/react-native-vexflow-seed)
  - [Vexflow+node](https://github.com/panarch/standalone-vexflow-context)
- [verovio](https://github.com/rism-ch/verovio)
- [flat.io](https://flat.io) (closed source)
- [musescore.org](htps://musescore.org) (did not find src yet)

### Spectograms

- https://smus.com/spectrogram-and-oscillator/
- https://listeningtowaves.github.io/Spectrogram/

### Waveforms

- [Peak.js](https://github.com/bbc/peaks.js)
- [Tone.js waveform](https://tonejs.github.io/examples/player.html)
- [Wavesurfer.js](https://wavesurfer-js.org/)

### Music Color & Geometry

- [Circle of Fifths](http://www.harmonagon.com/#)
- [Planetary Harmonic](https://www.lunarplanner.com/Harmonics/planetary-harmonics.html) (Get Note Color)
- [Music Color](https://roelhollander.eu/en/tuning-frequency/sound-light-colour/)
- [Music Geometry](https://roelhollander.eu/en/blog-music/music-geometry/)
- [Tonnetz + circle of fifth Paper](http://social.cs.uiuc.edu/papers/pdfs/bergstrom-isochords-2007.pdf)
- [Rhythm Geometry](https://www.dynamictonality.com/xronomorph.htm)
- [More Rhythm](http://www.petervandernoord.nl/polyrhythm/)
- [Circle of Fifths 2d+3d](http://cosmometry.net/basics-of-the-music-system)
- [4d music](http://mathemusic4d.net/)
- [Crazy Eso Theories](http://www.interferencetheory.com/index.html)
- [Visual Future of Music](https://visualfutureofmusic.blogspot.com/) (Crazy Visualization "Project")
  - [Psychotische Videos](https://vimeo.com/cantillate/videos)
- [partymode](https://preziotte.com/partymode/)

Coltrane Circle

- https://roelhollander.eu/en/blog-saxophone/Coltrane-Geometry/
- https://www.coreymwamba.co.uk/rambles/1388150764?cms_action=manage
- https://www.coreymwamba.co.uk/rambles/1388150764#comment-9f37190f

## Web Audio Libraries

### Theory

- [Tuna.js](https://github.com/abbernie/tune)
- [Tonal](https://github.com/danigb/tonal)

### Outputs Sound

- [Tone.js](https://github.com/Tonejs/Tone.js)
  - [MidiConvert](https://github.com/Tonejs/MidiConvert)
  - [Performance](https://github.com/Tonejs/Tone.js/wiki/Performance)
- [ABCjs](https://abcjs.net/#what)
- [MIDI.js](https://github.com/mudcube/MIDI.js/)
- [litsynth](https://github.com/padenot/litsynth) simple synth

### MIDI

- [jsmidigen](https://github.com/dingram/jsmidgen)
- [MIDI.js](https://github.com/mudcube/MIDI.js/)
- [MidiWriterJS](https://github.com/grimmdude/MidiWriterJS#vexflow-integration)

### Scheduling

- [bopper](https://github.com/mmckegg/bopper)
- [ditty](https://github.com/mmckegg/ditty)
- [dilla](https://github.com/adamrenklint/dilla)
  - [tutorial](http://adamrenklint.com/using-expressions-in-dilla)
- [WAA Clock](https://github.com/sebpiq/WAAClock)
- [web-audio-scheduler](https://github.com/mohayonao/web-audio-scheduler)

[DSP](https://github.com/corbanbrook/dsp.js/)

### Instruments

- [webaudiofont](https://github.com/surikov/webaudiofont)
- [Grand Piano](https://tambien.github.io/Piano/)

## Projects / Ideas / Playground

- [sharp11](https://github.com/jsrmath/sharp11) (ireal corpus playback + improvisation)
  - [demo](http://julianrosenblum.com/sharp11-client/)
- [chordease](http://chordease.sourceforge.net/index.html) remaps midi to fit leadsheet
- [viktor synth](https://nicroto.github.io/viktor/)
- [webaudio playground](http://webaudioplayground.appspot.com/)
- [jazzity](http://jazzity.com/keys/D/chords/minor-7)
- [FFT Visualization](https://jackschaedler.github.io/circles-sines-signals/dft_introduction.html)
- [loopdrop](http://loopjs.com/) looper, modular synth and sampler
  - [with push (video)](https://www.youtube.com/watch?v=2oVcNaDpPz0)
- [audio nodes](https://audionodes.com/) looks really good, closed src though :(
- [Paul Nasca](http://www.paulnasca.com/open-source-projects) (open source algorithms for music+picture)
- [Sheet Music Instructor](http://www.sheetmusictutor.com/)

### AI Stuff

- [deep learning + composition (folk music, abc notation)](https://highnoongmt.wordpress.com/2015/08/11/deep-learning-for-assisting-the-process-of-music-composition-part-1/)
- [ai music](https://medium.com/artists-and-machine-intelligence/neural-nets-for-generating-music-f46dffac21c0)
- [nsynth](https://nsynthsuper.withgoogle.com/)
- [lastm realbook](https://keunwoochoi.wordpress.com/2016/02/19/lstm-realbook/) (generates jazz chord progressions)
- [AI Piano Transcription](https://magenta.tensorflow.org/oaf-js)
  - [demo](https://piano-scribe.glitch.me/)
- [crazy max plugins](http://forumnet.ircam.fr/shop/en/)
  - [markov audio to score](http://nefeli.lib.teicrete.gr/browse/sefe/mta/2014/MorakeasMichail/attached-document-1402913270-993820-10855/MorakeasMichail2014.pdf)
  - [score following (video)](https://www.youtube.com/watch?v=YkMGtpcAA04)

### Algorithmic Composition

- http://donyaquick.com/
- http://www.euterpea.com/
- http://learnyouahaskell.com/introduction

### Blogs / Sites

- http://www.algorithmicjazz.com/
- [maker of ireal](http://www.massimobiolcati.com/)

## Tutorials

- [musicXML Midi](https://www.musicxml.com/tutorial/the-midi-compatible-part/)
- [Interactive Music](https://github.com/tambien/InteractiveMusic)
- [Pitch Detection](https://nbviewer.jupyter.org/gist/carlthome/1e7244e31bd628a0dba233b6dceebaef)

### Theory Tutorials

- [Voice Leading reddit thread](https://www.reddit.com/r/musictheory/comments/7t6j7o/is_smoothness_between_chord_changes_as_simple_as/)
- https://en.wikipedia.org/wiki/Counterpoint

### WAA Tutorials

- https://www.html5rocks.com/en/tutorials/webaudio/intro/
- http://blog.chrislowis.co.uk/2013/06/05/playing-notes-web-audio-api.html
- !!! http://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
- http://blog.szynalski.com/2014/04/web-audio-api/
- https://modernweb.com/creating-sound-with-the-web-audio-api-and-oscillators/
- [FFT](https://www.sitepoint.com/using-fourier-transforms-web-audio-api/)

## Live Coding

- [Tidal Cycles](https://tidalcycles.org/index.php/Tutorial)
- [Gibberwocky](http://gibberwocky.cc/)
  - [Paper](http://charlie-roberts.com/pubs/Live_Coding_DAW.pdf)
  - [Video](https://vimeo.com/187702511)
  - [genish.js](http://www.charlie-roberts.com/genish/tutorial/index.html)
- [Link Collection](https://github.com/toplap/awesome-livecoding/blob/master/README.md)

### One Line Music

http://wurstcaptures.untergrund.net/music/ bzw http://www.bemmu.com/music/index.html
visual: https://www.flickr.com/photos/kylemcdonald/sets/72157627762378810/
http://countercomplex.blogspot.com/2011/10/algorithmic-symphonies-from-one-line-of.html
