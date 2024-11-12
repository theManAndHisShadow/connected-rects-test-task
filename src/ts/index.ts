import { createCanvas, drawGrid, drawRect, fillLayer, getCoor as getColor } from "./core";

// init project canvas object
const canvas = createCanvas("#app-root", 500, 500);

// rendering backrgound layer once for better performance
fillLayer(canvas.background, getColor('carbon'));

drawGrid(canvas.background, {
    gridSize: 20,
    gridLineColor: 'rgba(255, 255, 255, 0.025)',
    gridLineThickness: 1,
});

// rendering foreground layer each frame
const loop = () => {
    requestAnimationFrame(loop);

    // make some basic actions
    const rect1 = drawRect(canvas.foreground, {
        size: {
            width: 100, height: 80,
        },

        position: {
            x: 30, y: 10,
        },

        style: {
            fillColor: getColor('darkRed'),
            borderColor: getColor('brightRed'),
            borderThickness: 2,
        },
    });

    const rect2 = drawRect(canvas.foreground, {
        size: {
            width: 100, height: 80,
        },

        position: {
            x: 230, y: 110,
        },

        style: {
            fillColor: getColor('darkBlue'),
            borderColor: getColor('brightBlue'),
            borderThickness: 2,
        },
    });


    const rect3 = drawRect(canvas.foreground, {
        size: {
            width: 100, height: 80,
        },

        position: {
            x: 150, y: 210,
        },

        style: {
            fillColor: getColor('darkGreen'),
            borderColor: getColor('brightGreen'),
            borderThickness: 2,
        },
    });
}

loop();

console.log(canvas);