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
          container.appendChild(backgroundCanvas);
          container.appendChild(foregroundCanvas);
          container.style.width = `${width}px`;        // set height for flexible centrizing
          container.style.height = `${height}px`;      // set height for flexible centrizing
    
    // mounting canvas to app root
    const appRoot = document.querySelector('#app-root');
          appRoot.appendChild(container);

    // build result object
    const result: InteractiveCanvas = {
        background: backgroundCanvas.getContext('2d'),
        foreground: backgroundCanvas.getContext('2d'),
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