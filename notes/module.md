# jazzband Module

This document tries to find the best module format

## Native Browser Modules

It would be nice to be able to import the jazzband package natively without needing to use a build tool:

```html
<button id="play">PLAY</button>
<script type="module">
  import * as jazz from './node_modules/jazzband/lib/index.js';
  const context = new AudioContext();
  const band = new jazz.Trio({ context });
  const playButton = document.getElementById('play');
  playButton.addEventListener('click', () => {
    band.comp({ chords: ['D-7', 'G7', 'C^7', 'C^7'] }, { bpm: 120 });
  });
</script>
```

see https://developers.google.com/web/fundamentals/primers/modules

Currently, this does not possible due to typescript issues:
- https://github.com/Microsoft/TypeScript/issues/16577

### Possible Workarounds

- https://github.com/guybedford/isomorphic-browser-modules
- https://github.com/guybedford/es-module-shims
- https://github.com/TypeStrong/ts-loader#appendtssuffixto-regexp-default

- https://github.com/WICG/import-maps
- https://developers.google.com/web/updates/2017/11/dynamic-import