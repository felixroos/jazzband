import { Scale, Note } from 'tonal';
import * as TonalArray from 'tonal-array';
import * as Tone from 'tone';
import { Numeric } from '../lib/util/Numeric';
import { Pattern } from '../lib/util/Pattern';
import { randomItem, randomScale } from '../src/symbols';
import { getPatternInChord } from '../src/util/util';

const random255 = () => Math.floor(Math.random() * 255);

window.onload = function() {
  function drawPoints(points, duration = 1000, delay = 0, color, lineWidth) {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const random255 = () => Math.floor(Math.random() * 255);
    color = color || `rgb(${random255()},${random255()},${random255()})`;
    lineWidth = lineWidth || 1;
    points.forEach((p, i) => {
      const getPos = p => [p[0], canvas.height - p[1]];
      const pos = getPos(p);
      const last = i === 0 ? pos : getPos(points[i - 1]);
      const drawPoint = () => {
        context.beginPath();
        context.lineWidth = lineWidth;
        context.moveTo(last[0], last[1]);
        context.lineTo(pos[0], pos[1]);
        context.strokeStyle = color;
        context.stroke();
        context.closePath();
      };
      if (delay === 0 && duration === 0) {
        drawPoint();
      } else {
        setTimeout(() => {
          drawPoint();
        }, (i * duration) / points.length + delay);
      }
    });
  }

  const saw = ([min, max], m = 1) => x => {
    const d = max - min + 1;
    return ((m * x) / d - Math.floor((m * x) / d)) * d + min;
  };

  const canvas = document.getElementById('canvas');

  const plotter = Numeric.range(0, canvas.width);

  /* const points = plotter
    .plot(saw([1, canvas.height / 4], 1))
    .render()
    .map((y, x) => [x, y]); */

  // let i = 0;
  /* while (i < 10) {
    const f = Math.random() * 10;
    const a = canvas.height * Math.random();
    const points = Numeric.fixed(canvas.width)
      .sequence(Numeric.triangle([1, a], f))
      .map((y, x) => [x, y]);
    console.log('i', i);

    drawPoints(points, duration, i * duration);
    ++i;
  } */

  function getPoints(pattern, width, height, flip = false) {
    const max = Math.max(...pattern) + 1;
    return pattern.map((value, i) => {
      if (!Array.isArray(value)) {
        let [x, y] = [
          Math.round((i / pattern.length) * width),
          Math.round((value / max) * height)
        ];
        if (flip) {
          y = height - y;
        }
        return { x, y, value };
      }
    });
  }

  const grad = [
    [random255(), random255(), random255()],
    [random255(), random255(), random255()]
  ];
  function drawPattern(pattern, offset = 0, active) {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    context.fillStyle = '#101010';
    context.fillRect(0, 0, width, height);
    pattern = Pattern.flat(pattern);

    pattern = TonalArray.rotate(offset, pattern);
    const points = getPoints(pattern, width, height, false);
    const max = Math.max(...pattern);
    let activeIndex;
    if (active !== undefined) {
      activeIndex = (active - offset + points.length) % points.length;
    }

    const gradient = (from, to, progress) => {
      return to.map((channel, i) => from[i] + progress * (channel - from[i]));
    };

    points.forEach((p, i) => {
      const pw = width / points.length;
      const ph = height / (max + 1);
      const progress = i / pattern.length;
      const strength = p.y / height;
      const scale = Scale.notes(scaleInput.value);
      const note = (p.value % scale.length) / scale.length;

      const rgbString = rgb => {
        return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      };
      const hslString = hsl => {
        return `hsl(${hsl[0]},${hsl[1]}%,${hsl[2]}%)`;
      };
      let color;
      if (i === activeIndex) {
        context.fillStyle = rgbString([255, 0, 0]);
      } else {
        // color = gradient(grad[0], grad[1], progress * strength);
        color = hslString([Math.floor(note * 360), 50, 50]);
      }
      context.fillStyle = color;
      const h = p.y;
      context.fillRect(pw * i, height - h - ph, pw, ph);
    });
  }

  function plot(f, duration = 0, delay = 0, color, lineWidth, progress = 1) {
    drawPoints(
      Numeric.plot(f)
        .range(0, canvas.width * progress)
        .render()
        .map((y, x) => [x /* + (progress * canvas.width) / 2 */, y]),
      duration,
      delay,
      color,
      lineWidth
    );
  }

  /* plot(x => Math.tan(x/200)+canvas.height/2); */

  const plotAll = (total, rotation = 0, amplitude = 1, colors, time) => {
    const sin = (cw, ch, a = 1, offset = 0) => x =>
      (ch / 2) *
        a *
        Math.sin((x * 4 * Math.PI + cw * Math.PI * 2 * offset) / cw) +
      ch / 2;

    const totalDuration = 3000;
    const concurrency = 1;

    let i = 1;
    const context = canvas.getContext('2d');
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const lineFactor = 20;

    while (i <= total) {
      const prg = i / total;
      /* const delay = (i - 1) * singleDuration; */
      /* const clr = `rgb(${color[0] * prg},${color[1] * prg},${color[2] * prg})`; */
      plot(
        sin(canvas.width, canvas.height, prg * amplitude, prg * rotation),
        /* x =>
          amplitude * prg * Math.tan(x / 10 + prg * 2 * Math.PI) + //  rotation
          (canvas.height / 2) * prg, */
        /* x => x*prg*2+prg*2, */
        0, //singleDuration,
        0, //delay / concurrency,
        colors[i],
        prg * lineFactor,
        Math.sin(prg * time)
      );
      i++;
    }
  };

  const randomColor = () => `rgb(${random255()},${random255()},${random255()})`;

  let start = 0;

  const total = 30;

  const colors = new Array(total + 1).fill(0).map(n => randomColor());

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;

    const s = Math.sin(timestamp / 1000) + 0.5;
    const c = Math.cos(timestamp / 1000) + 0.5;

    const m = Math.sin(timestamp / 10000) + 0.5;

    /* const color = [c * 30 + s * 20, 200, c * 80 + s * 100 * m * 2]; */

    plotAll(total, -progress / 3000, m, colors, timestamp / 10000);

    /* if (progress < 20000) { */
    window.requestAnimationFrame(step);
    /* } */
  }

  document.getElementById('screensaver').addEventListener('click', () => {
    window.requestAnimationFrame(step);
  });

  document.getElementById('randomPattern').addEventListener('click', () => {
    const scaleName = randomScale('Advanced');
    const tonic = randomItem(Note.names(' b'));
    const steps = new Array(Scale.notes(tonic + ' ', scaleName).length + 1)
      .fill(0)
      .map((e, i) => i + 1);
    scaleInput.value = tonic + ' ' + scaleName;
    const scale = Scale.notes(scaleInput.value);

    patternA.value = steps
      .map(n => Math.floor(Math.random() * steps.length + 1))
      .join(' ');
    console.log('(scale.length', scale.length);

    patternB.value = [
      randomItem(steps),
      randomItem(steps),
      randomItem(steps),
      randomItem(steps)
    ].join(' ');

    const patterns = readPatterns();
    const nestedPattern = nestPatterns(patterns);
    drawPattern(nestedPattern, 0);
  });

  document.getElementById('flipPattern').addEventListener('click', () => {
    const scale = Scale.notes(scaleInput.value);

    const flip = (pattern, flipY = false) => {
      return pattern.reverse().map(n => (flipY ? scale.length - n : n));
    };
    let patterns = readPatterns();
    patternA.value = flip(patterns[0])
      .map(n => n + 1)
      .join(' ');
    patternB.value = flip(patterns[1], true)
      .map(n => n + 1)
      .join(' ');

    patterns = readPatterns();
    const nestedPattern = nestPatterns(patterns);
    drawPattern(nestedPattern);
  });

  let seq;

  function readPatterns() {
    return [
      (patternA.value || '1').split(' ').map(n => parseInt(n) - 1),
      (patternB.value || '1').split(' ').map(n => parseInt(n) - 1)
    ];
  }

  function nestPatterns(patterns) {
    return Pattern.flat(Pattern.nestIndices(...patterns));
  }

  let frame;
  function pattern(lines) {
    console.log('lines', lines);

    const synth = new Tone.PolySynth(4, Tone.Synth, {
      volume: -18,
      envelope: {
        attack: 0.02
      },
      oscillator: {
        partials: [1, 2, 3]
      }
    }).toMaster();

    Tone.Transport.bpm.value = 180;
    if (seq) {
      seq.stop();
    }

    const nestedPattern = lines.reduce((combined, line) => {
      return combined.concat(nestPatterns(line));
    }, []);

    drawPattern(nestedPattern, 0);

    const notes = lines.reduce((combined, line) => {
      let scale = 'C major';
      line = Pattern.render(scale, line, ['G2', 'G5']);
      return combined.concat(line);
    }, []);

    /*

const rendered = lines
      .reduce((combined, line) => {
        const nested = Pattern.flat(Pattern.nestIndices(...line));
        return combined.concat(nested);
      }, [])
      .map(e => {
        const tokens = e.split(' ');
        const scale = tokens[0].replace('.', ' ');
        const degree = parseInt(tokens[1]) - 1;
        console.log('scale', scale, degree);

        const line = Pattern.render(scale, [[degree]], ['G2', 'G5']);
        console.log('line', line);

        return line;
      });
    console.log('rendered', rendered);

    */

    // const patterns = readPatterns();
    // const nestedPattern = nestPatterns(patterns);
    // drawPattern(nestedPattern, 0);

    /* const notes = Pattern.render(scaleInput.value || 'C major', patterns, [
      'G2',
      'G5'
    ]); */

    let activeIndex;
    seq = new Tone.Sequence(
      (time, event, index) => {
        /* if (Math.random() > 0.9) {
          return;
        } */
        // /* offset + activeIndex */
        activeIndex = notes.indexOf(event);
        Tone.Draw.schedule(() => {
          drawPattern(nestedPattern, 0, activeIndex);
        }, time);
        synth.triggerAttackRelease(event.note, '4n', time);
      },
      notes,
      '4n'
    );
    seq.start(0);
    Tone.Transport.start('+1');

    function updatePlayhead() {
      drawPattern(nestedPattern, 0, activeIndex);
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');
      const x = seq.progress * canvas.width;
      context.beginPath();
      context.moveTo(x, 0);
      // End point (180,47)
      context.lineTo(x, canvas.height);
      // Make the line visible
      context.lineWidth = 2;
      context.strokeStyle = '#fff';
      context.stroke();
      frame = requestAnimationFrame(updatePlayhead);
    }
    frame = requestAnimationFrame(updatePlayhead);
  }

  function parsePatterns(text) {
    const lines = text.split('\n').map(line =>
      line.split('>').map(p =>
        p
          .trim()
          .split(' ')
          .map(n => (isNaN(n) ? n : parseInt(n) - 1))
      )
    );
    return lines;
  }

  const textarea = document.getElementById('textarea');
  textarea.value = ['1 2 5 1 > 8 7 5 3', '1 6 2 5 > 1 2 3 5'].join('\n');
  textarea.addEventListener('blur', () => {
    console.log('blur', textarea.value);
    if (seq) {
      console.log('seq', seq);
      seq.removeAll();
    }
  });

  playPattern.addEventListener('click', () => {
    const textarea = document.getElementById('textarea');
    const lines = parsePatterns(textarea.value);

    pattern(lines);
  });
  stopPattern.addEventListener('click', () => {
    /* seq.stop(); */
    cancelAnimationFrame(frame);
    Tone.Transport.stop();
  });
};
