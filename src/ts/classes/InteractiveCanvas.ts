class Layer {
    parent: InteractiveCanvas;
    body: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(parent: InteractiveCanvas, className: string){
        this.parent = parent;

        const layerCanvas = document.createElement('canvas');
              layerCanvas.width = this.parent.width;
              layerCanvas.height = this.parent.height;
              layerCanvas.classList.add(className);

        this.body = layerCanvas;
        this.context = layerCanvas.getContext('2d');
    }

    fill(color: string){
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.parent.width, this.parent.height);
    }
}

export default class InteractiveCanvas {
    width: number;
    height: number;
    background: Layer;
    foreground: Layer;

    constructor(cssSelector: string, width: number, height: number){
        this.width = width;
        this.height = height;
        this.background = new Layer(this, 'app-canvas__background');
        this.foreground = new Layer(this, 'app-canvas__foreground');

        // creating and tuning canvas container element
        const container = document.createElement('div');
            container.classList.add('app-canvas__container');
            container.appendChild(this.background.body);
            container.appendChild(this.foreground.body);
            container.style.width = `${width}px`;        // set height for flexible centrizing
            container.style.height = `${height}px`;      // set height for flexible centrizing

        // mounting canvas to app root
        const appRoot = document.querySelector(cssSelector);
              appRoot.appendChild(container);
    }
}