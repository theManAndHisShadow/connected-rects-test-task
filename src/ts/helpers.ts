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

export function getColor(name: string): string {
    interface colorStorage {
        [key: string]: string,
    }

    const colors: colorStorage = {
        carbon:      'rgba(14, 14, 14, 1)',
        darkRed:     'rgba(38, 12, 12, 1)',
        brightRed:   'rgba(114, 6, 6, 1)',

        darkBlue:    'rgba(12, 16, 38, 1)',
        brightBlue:  'rgba(9, 12, 104, 1)',

        darkGreen:   'rgba(12, 38, 12, 1)',
        brightGreen: 'rgba(6, 114, 6, 1)',
    }

    return colors[name];
}