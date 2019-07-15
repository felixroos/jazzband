import { Note } from 'tonal';
import * as Tone from 'tone';

function portion(v, [a, b], max) {
  return Math.ceil(((v - a) / (b - a)) * max);
}

export function getRect(value, timeRange, midiRange, flip = false) {
  const canvas = document.getElementById('canvas');
  const width = canvas.width;
  const height = canvas.height;

  const { time, note, duration } = value;

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
      width: portion(1, [0, maxMidi], width),
      height: h
    };
  } else {
    point = {
      ...point,
      x: portion(time, timeRange, width),
      y: height - portion(Note.midi(note), midiRange, height),
      width: portion(duration, [0, maxTime], width),
      height: portion(1, [0, maxMidi], height)
    };
  }
  return point;
}

export function drawEvents(events, range, midiRange, flip = false) {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;
  midiRange = midiRange || [0, 100];

  const points = events.map(({ value }) =>
    getRect(value, range, midiRange, flip)
  );

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  let activeIndex;
  /* if (active !== undefined) {
    activeIndex = (active + points.length) % points.length;
  } */

  const gradient = (from, to, progress) => {
    return to.map((channel, i) => from[i] + progress * (channel - from[i]));
  };

  points.forEach(({ x, y, width, height, note }, i) => {
    const rgbString = rgb => {
      return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    };
    const hslString = hsl => {
      return `hsl(${hsl[0]},${hsl[1]}%,${hsl[2]}%)`;
    };
    let color, border;
    if (i === activeIndex) {
      context.fillStyle = rgbString([255, 0, 0]);
    } else {
      // color = gradient(grad[0], grad[1], progress * strength);
      color = hslString([
        Math.floor(((Note.props(note).chroma) / 12) * 360),
        50,
        50
      ]);
      border = hslString([
        Math.floor((Note.props(note).chroma / 12) * 360),
        50,
        20
      ]);
    }

    context.fillStyle = color;
    context.strokeStyle = border;

    // context.fillRect(x, y, width, height);
    roundRect(context, x, y, width, height, 3, true, true);
  });
}

export function drawPiano({ time, duration }, timeWindow, midiWindow, flip) {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  for (let i = midiWindow[0]; i < midiWindow[1]; ++i) {
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
    context.fillStyle = isBlack ? '#000' : '#fff';
    context.strokeStyle = isBlack ? '#aaa' : '#c0c0c0';
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
    // context.fillRect(x, y, width, height);
  }
}

export function drawPlayhead({ time, duration }, timeWindow, midiWindow, flip) {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  const value = portion(time, timeWindow, flip ? canvas.height : canvas.width);

  context.beginPath();
  if (flip) {
    const y = canvas.height - value;
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  } else {
    context.moveTo(value, 0);
    context.lineTo(value, canvas.height);
  }
  context.lineWidth = 1;
  context.strokeStyle = '#000';
  context.stroke();
}

export function drawPart(part, callback) {
  const canvas = document.getElementById('canvas');
  const paint = () => {
    const events = part._events;
    const seconds = Tone.Transport.seconds;
    const lastEvent = events[events.length - 1];
    // const end = lastEvent.value.time + lastEvent.value.duration;
    const flip = false;
    const thickness = 1;
    const timeWindow = [seconds - thickness, seconds + 20];
    const midiWindow = [25, 90];
    drawEvents(events, timeWindow, midiWindow, flip);
    /* drawPlayhead(
      { time: seconds || 0, duration: thickness },
      timeWindow,
      midiWindow,
      flip
    ); */
    drawPiano(
      { time: seconds || 0, duration: thickness },
      timeWindow,
      midiWindow,
      flip
    );

    callback(paint);
  };
  callback(paint);
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
