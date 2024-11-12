// some project "settings"
const width = 500;
const height = 500;
const fillColor = 'rgba(0, 0, 0, 0.2)';
const welcomeText = "Hello world!";

// create and tune canvas and context
const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

// make some basic actions
const context = canvas.getContext('2d');
      context.fillStyle = fillColor;
      context.fillRect(0, 0, width, height);

      context.fillStyle = 'white';
      context.font = "25px monospace";
      context.fillText(welcomeText, width / 2 - 100, height / 2);

// mounting canvas to app root
const appRoot = document.querySelector('#app-root');
      appRoot.appendChild(canvas);