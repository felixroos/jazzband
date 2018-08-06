import Band from '../band/src/Band';
// import Band from '../band/dist/Band';

window.onload = function () {
    const button = document.getElementById('play');
    const band = new Band({ context: new AudioContext() });
    console.log('band', band);
    button.addEventListener('click', () => {
        band.ready().then(() => {
            band.compBars(['D-7', 'G7', 'C^7', 'C^7'], 4);
        });
    })
}
