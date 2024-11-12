import { drawGrid, getColor } from "./helpers";
import InteractiveCanvas from "./classes/InteractiveCanvas";
import RectangleShape from "./classes/Reactangle";

// init project canvas object
const canvas = new InteractiveCanvas("#app-root", 500, 500);

// rendering background layer once for better performance
canvas.background.fill(getColor('carbon'));

// render simple grid to backrgound
drawGrid(canvas.background.context, {
    gridSize: 20,
    gridLineColor: 'rgba(255, 255, 255, 0.025)',
    gridLineThickness: 1,
});

 // creating base shapes
 const rect1 = new RectangleShape({
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

const rect2 = new RectangleShape({
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


const rect3 = new RectangleShape({
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

// rendering foreground layer each frame
const loop = () => {
    requestAnimationFrame(loop);

    rect1.renderAt(canvas.foreground.context);
    rect2.renderAt(canvas.foreground.context);
    rect3.renderAt(canvas.foreground.context);
}

loop();

console.log(canvas, rect1);