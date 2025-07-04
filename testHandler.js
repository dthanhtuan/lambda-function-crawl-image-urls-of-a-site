// Import the handler function from index.js
const { handler } = require('./index');

// Define a mock event object
const EVENT = {
    "url": "https://www.instagram.com/p/C82Exuvoy5_/?utm_source=ig_web_copy_link&img_index=1",
    "minWidth": 200,
    "minHeight": 100
};

handler(EVENT, {})
    .then(payload => {
        const body = JSON.parse(payload.body);
        console.log('Total images:', body.totalImages);
        body.imageSources.forEach((image, index) => {
            console.log(`Image ${index + 1}: ${image.src}`);
        });
    })
    .catch(err => {
        console.error('Error:', err);
    });
