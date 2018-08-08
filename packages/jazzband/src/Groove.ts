export class Track {
    pattern: (props: any) => any[];
    onPlay?: ({ track, pulse, measures, patterns, settings }) => any;
    [key: string]: any;
    constructor(props?) {
        Object.assign(this, props);
        this.pattern = props.pattern;
        this.onPlay = props.onPlay;
    }
    play({ track, pulse, measures, patterns, settings }, callback) {
        if (this.onPlay) {
            return this.onPlay({ track, pulse, patterns, measures, settings });
        }
        pulse.tickArray(patterns, (t) => callback(this, t));
    }
}

export class Groove {
    tracks: any[];
    constructor(tracks: any[], onPlay?) {
        this.tracks = tracks.map(track => new Track(track));
    }
    play({ measures, pulse, settings }, callback: (track, tick) => any) {
        this.tracks.forEach(track => {
            const patterns = measures.map(measure => track.pattern({ measure, settings, pulse })
                .slice(0, Math.floor(settings.cycle)));
            track.play({ track, pulse, measures, patterns, settings }, callback);
        });
    }
}