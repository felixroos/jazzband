import { Note } from 'tonal';
import * as Tone from 'tone';

function portion(v, [a, b], max) {
  return Math.ceil(((v - a) / (b - a)) * max);
}

function useCanvas(canvas, scale = 2) {
  return [canvas.width, canvas.height, canvas.getContext('2d')];
}

export function getRect(value, timeRange, midiRange, flip = false) {
  const canvas = document.getElementById('canvas');
  const [width, height] = useCanvas(canvas);

  const { time, note, duration, span } = value;

  const maxMidi = midiRange[1] - midiRange[0];
  const maxTime = timeRange[1] - timeRange[0];
  let point = {
    value: Note.midi(note),
    note
  };
  if (flip) {
    const h = portion(duration, [0, maxTime], height);
    point = {
      ...point,
      x: portion(Note.midi(note), midiRange, width),
      y: height - portion(time, timeRange, height) - h,
      width: portion(span || 1, [0, maxMidi], width),
      height: h
    };
  } else {
    point = {
      ...point,
      x: portion(time, timeRange, width),
      y: height - portion(Note.midi(note), midiRange, height),
      width: portion(duration, [0, maxTime], width),
      height: span || portion(span || 1, [0, maxMidi], height)
    };
  }
  return point;
}

function drawText(text, a, b = 0, flip) {
  const canvas = document.getElementById('canvas');
  const [width, height, context] = useCanvas(canvas);
  if (flip) {
    context.fillText(text, b, height - 5 - a);
  } else {
    context.fillText(text, a + 5, height - 5 - b);
  }
}

export function drawEvents(events, range, midiRange, flip = false) {
  const canvas = document.getElementById('canvas');
  const [width, height, context] = useCanvas(canvas);

  midiRange = midiRange || [0, 100];
  // clear rect
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  const visibleEvents = events.filter(
    ({ value }) =>
      range[0] <= value.time + value.duration && value.time <= range[1]
  );

  const scrollSide = flip ? height : width;
  const pianoSide = !flip ? height : width;

  // bars starters
  visibleEvents
    .filter(({ value }) => value.path[1] === 0 && value.path.length === 2)
    .forEach(({ value }, i, starters) => {
      const last = i ? starters[i - 1].value : null;
      const options = value.options || {};
      const section =
        !last || !last.options || last.options.section !== options.section
          ? options.section
          : '';
      if (value.type === 'chord') {
        let barColor;
        if (value.path[0] === 0 || section) {
          barColor = '#000';
        } else if (value.path[0] % 4 === 0) {
          barColor = '#aaa';
        } else {
          barColor = '#efefef';
        }
        drawLine(value.time, range, flip, barColor);
      }
      // barline
      // drawLine(value.time, range, flip, '#efefef');

      const pos = portion(value.time, range, scrollSide);
      const first = portion(range[0] + 1, range, scrollSide);
      // sections
      if (value.measure) {
        // console.log('measure', value.options);
      }
      if (section) {
        context.font = '60px monospace';
        context.fillStyle = '#121212';
        drawText(section, Math.max(pos, first), pianoSide - 60, flip);
      }
    });

  visibleEvents.forEach(({ value }) => {
    if (value.chord) {
      const [width, height] = useCanvas(canvas);
      const pos = portion(value.time, range, flip ? height : width);
      context.font = '40px monospace';
      context.fillStyle = '#121212';
      if (value.type === 'chord') {
        drawText(value.chord, pos, pianoSide - 95, flip);
        return;
      }
    }
    // fill range rects

    /* 
    const options = value.options;
    if (options.voicings && options.voicings.range) {
      const v = options.voicings.range.map(n => Note.midi(n));
      const span = v[1] - v[0];
      const { x, y, width, height } = getRect(
        {
          time: value.time,
          duration: value.duration,
          note: options.voicings.range[0],
          span
        },
        range,
        midiRange,
        flip
      );
      context.fillStyle = 'rgba(100,100,200,0.2)';
      context.fillRect(x, y, width, height);
    } */

    // fill note rects
    const rect = getRect(value, range, midiRange, flip);
    const { x, y, width, height, note } = rect;

    context.fillStyle = value.color || noteColor(note, 50, 50);
    context.strokeStyle = noteColor(note, 50, 20);
    // context.fillRect(x, y, width, height);
    roundRect(context, x, y, width, height, 3, true, true);
  });
}

export function noteColor(note, sat, lit) {
  const hslString = hsl => {
    return `hsl(${hsl[0]},${hsl[1]}%,${hsl[2]}%)`;
  };
  /* const rgbString = rgb => {
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }; */
  return hslString([
    Math.floor((Note.props(note).chroma / 12) * 360),
    sat,
    lit
  ]);
}

export function drawPiano(
  { time, duration, active },
  timeWindow,
  midiWindow,
  flip
) {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  for (let i = midiWindow[0]; i <= midiWindow[1]; ++i) {
    const note = Note.fromMidi(i);
    const isBlack = Note.props(note).acc !== '';
    const thickness = duration; // - (isBlack ? duration / 3 : 0);
    const { x, y, width, height } = getRect(
      {
        time: time - thickness,
        duration: thickness,
        note
      },
      timeWindow,
      midiWindow,
      flip
    );
    let color, border;

    if (!active.find(n => Note.midi(n) === i)) {
      color = isBlack ? '#000' : '#fff';
      border = isBlack ? '#aaa' : '#c0c0c0';
    } else {
      color = noteColor(note, 50, 50);
      border = noteColor(note, 50, 20);
    }
    context.fillStyle = color;
    context.strokeStyle = border;
    roundRect(
      context,
      x,
      y,
      width,
      height,
      { bl: 3, br: 3, tl: 0, tr: 0 },
      true,
      true
    );
    if (Note.pc(note) === 'C') {
      drawLine(flip ? i : i - 1, midiWindow, !flip, '#ccc');
    }
  }
}

export function drawLine(number, window, flip, stroke = '#000') {
  const canvas = document.getElementById('canvas');
  const [width, height, context] = useCanvas(canvas);
  context.beginPath();

  const value = portion(number, window, flip ? height : width);
  if (flip) {
    const y = height - value;
    context.moveTo(0, y);
    context.lineTo(width, y);
  } else {
    context.moveTo(value, 0);
    context.lineTo(value, height);
  }
  context.lineWidth = 1;
  context.strokeStyle = stroke;
  context.stroke();
}

export function drawPart(part, callback, flip = true) {
  const events = part._events;
  const paint = () => {
    const seconds = Tone.Transport.seconds;
    const lastEvent = events[events.length - 1];
    // const end = lastEvent.value.time + lastEvent.value.duration;
    const thickness = 1;
    const timeWindow = [seconds - thickness, seconds + 10];
    const midiWindow = [25, 88];
    drawEvents(events, timeWindow, midiWindow, flip);
    const active = events
      .filter(
        ({ value }) =>
          seconds >= value.time && seconds <= value.time + value.duration
      )
      .map(({ value }) => value.note);

    drawPiano(
      { time: seconds || 0, duration: thickness, active },
      timeWindow,
      midiWindow,
      flip
    );
    callback && callback(paint);
  };
  callback && callback(paint);
  return paint;
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
export function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
