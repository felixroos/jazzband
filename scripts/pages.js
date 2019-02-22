var ghpages = require('gh-pages');

ghpages.publish('demo/dist', function (err) {
    if (error) {
        console.log('error', error);

    } else {
        console.log('deployed gh-pages!');
    }
});