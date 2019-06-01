export const cherryOnTop = {
    snippet: `
    |  C^7  |  D-7  |  Eb13  |  F^7  |
    |  Bb9  |  F^7  |  C#^7  |  C^7  |
    `,
    options: {
        voicings: {
            range: ['C3', 'C5'], // allowed voice range
            maxVoices: 4, // maximum number of voices per chord
            maxDistance: 7,  // general max distance between single voices
            minDistance: 1,  // general max distance between single voices
            minBottomDistance: 3, // min semitones between the two bottom notes
            minTopDistance: 2, // min semitones between the two top notes
            noTopDrop: true,
            noTopAdd: true,
            topNotes: ['C'],
            noBottomDrop: false,
            noBottomAdd: true,
            logging: true
        },
    }
}
/*
|  C^7  |  D-7  |  Eb13 F#7b5  |  F^7  |
|  Bb9  |  F^7  |  C#^7 F-7    |  C^7  |
*/