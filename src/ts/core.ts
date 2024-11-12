export function createCanvas(cssSelector: string, width: number, height: number): InteractiveCanvas {
    // creating and tuning background canvas
    const backgroundCanvas = document.createElement('canvas');
          backgroundCanvas.width = width;
          backgroundCanvas.height = height;
          backgroundCanvas.classList.add('app-canvas__background');

    // creating and tuning foreground canvas
    const foregroundCanvas = document.createElement('canvas');
          foregroundCanvas.width = width;
          foregroundCanvas.height = height;
          foregroundCanvas.classList.add('app-canvas__foreground');

    // creating and tuning canvas container element
    const container = document.createElement('div');
          container.classList.add('app-canvas__container');
          container.appendChild(foregroundCanvas);
          container.appendChild(backgroundCanvas);
          container.style.width = `${width}px`;        // set height for flexible centrizing
          container.style.height = `${height}px`;      // set height for flexible centrizing
    
    // mounting canvas to app root
    const appRoot = document.querySelector('#app-root');
          appRoot.appendChild(container);

    // build result object
    const result: InteractiveCanvas = {
        background: backgroundCanvas.getContext('2d'),
        foreground: foregroundCanvas.getContext('2d'),
        width: width,
        height: height,
    }

    return result;
}

export function drawRect(context: CanvasRenderingContext2D, params: Rect): Rect {
    context.fillStyle = params.style.fillColor;
    context.strokeStyle = params.style.borderColor;
    context.lineWidth = params.style.borderThickness;

    context.fillRect(params.position.x, params.position.y, params.size.width, params.size.height);
    if(params.style.borderThickness > 0) context.strokeRect(params.position.x, params.position.y, params.size.width, params.size.height);

    return params;
}

export function drawGrid(context: CanvasRenderingContext2D, params: {gridSize: number, gridLineThickness: number, gridLineColor: string}): void{
    const { width, height } = context.canvas;

    context.strokeStyle = params.gridLineColor;
    context.lineWidth = params.gridLineThickness;

    // single 'beginPath'call - faster result
    context.beginPath();

    // draw a vertical and horizontal lines
    for (let x = 0; x <= width; x += params.gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += params.gridSize) {
        context.moveTo(0, y);
        context.lineTo(width, y);
    }

    context.stroke();
}
