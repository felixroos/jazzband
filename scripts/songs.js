const fs = require('fs');
const iRealReader = require('ireal-reader');
const RealParser = require('../lib/sheet/RealParser').RealParser;
/* // parse sheets
fs.readFile('../songs/1350.json', 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    const link = JSON.parse(data);
    const playlist = iRealReader(link);
    playlist.songs = playlist.songs.map(song => {
        delete song.music.measures;
        song.music.sheet = RealParser.parseSheet(song.music.raw);
        return song;
    });
    console.log(JSON.stringify(playlist.songs));
}); */

fs.readFile('./sheets.json', 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    const songs = JSON.parse(data);
    let chords = [];
    songs.forEach(song => {
        chords = chords.concat(song.music.sheet
            .reduce((all, measure) => all.concat(measure.chords), [])
        );
    });
    chords = chords.filter(c => !!c).filter((v, i, a) => a.indexOf(v) === i);
    /* console.log(JSON.stringify(chords)); */

    const symbols = chords.map(chord => chord
        .replace(/[A-G][b#]?/, '')
        .replace(/\/.*/, '')
    ).filter((v, i, a) => a.indexOf(v) === i);
    console.log(JSON.stringify(symbols));
});


