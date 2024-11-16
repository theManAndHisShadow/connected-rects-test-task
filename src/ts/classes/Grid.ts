import Layer from "./Layer";

export default class Grid {
    points: Point[];
    parent: Layer;

    constructor(parent: Layer) {
        this.parent = parent;
        this.points = this.generate();
    }

    private generate() {
        const points = [];
        const allLayerItems = this.parent.children;

        for (let item of allLayerItems) {
            let { x, y } = item.position;
            let { width, height } = item.size;
            let halfWidth = width / 2;
            let halfHeight = height / 2;

            let centerPoint = { x: x + halfWidth, y: y + halfHeight };

            points.push(centerPoint);
        }

        return points;
    }

    update(){
        this.points = this.generate();
    }

    renderAt(context: CanvasRenderingContext2D) {
        this.points.forEach(point => {
            context.beginPath();
            context.arc(point.x, point.y, 3, 0, 2 * Math.PI, false);
            context.fillStyle = 'magenta';
            context.strokeStyle = 'magenta';
            context.fill();
            context.stroke();
            context.closePath();
        });
    }
}