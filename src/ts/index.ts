import { createCanvas } from "./core";

// init project canvas object
const canvas = createCanvas("#app-root", 500, 500);

// make some actions below
const fillColor = 'rgba(0, 0, 0, 0.2)';
const welcomeText = "Hello world!";

// make some basic actions
canvas.foreground.fillStyle = fillColor;
canvas.foreground.fillRect(0, 0, canvas.width, canvas.height);

canvas.foreground.fillStyle = 'white';
canvas.foreground.font = "25px monospace";
canvas.foreground.fillText(welcomeText, canvas.width / 2 - 100, canvas.height / 2);