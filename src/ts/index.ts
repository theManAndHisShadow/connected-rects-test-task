import { createCanvas, drawGrid, drawRect } from "./core";

// init project canvas object
const canvas = createCanvas("#app-root", 500, 500);

// make some actions below
const fillColor = 'rgba(0, 0, 0, 0.2)';
const welcomeText = "Hello world!";

// make some basic actions
canvas.foreground.fillStyle = fillColor;
canvas.foreground.fillRect(0, 0, canvas.width, canvas.height);

drawGrid(canvas.background, {
    gridSize: 20,
    gridLineColor: 'rgba(255, 255, 255, 0.025)',
    gridLineThickness: 1,
});

// make some basic actions
const rect1 = drawRect(canvas.foreground, {
    size: {
        width: 100, height: 80,
    },

    position: {
        x: 30, y: 10,
    },

    style: {
        fillColor: 'rgba(255, 0, 0, 0.1)',
        borderColor: 'rgba(255, 0, 0, 0.3)',
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
        fillColor: 'rgba(0, 40, 255, 0.1)',
        borderColor: 'rgba(0, 0, 255, 0.3)',
        borderThickness: 2,
    },
});

console.log(canvas, rect1, rect2);