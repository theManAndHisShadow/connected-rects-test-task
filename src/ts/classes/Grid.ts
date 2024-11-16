import ConnectionLine from "./ConnectionLine";
import Layer from "./Layer";

export default class Grid {
    parent: ConnectionLine;
    points: Point[];

    constructor(parent: ConnectionLine) {
        this.parent = parent;
        this.points = this.generate();
    }

    private generate() {
        const points = [];
        const endPoints = this.parent.endPoints;

        for (let endPoint of endPoints) {
            const { x, y } = endPoint.parent.position;
            const { width, height } = endPoint.parent.size;
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            const offset = endPoint.parent.style.margin;

            const centerPoint =       { x: x + halfWidth, y: y + halfHeight };
            const topCenterPoint =    { x: x + halfWidth, y: y - offset };
            const leftCenterPoint =   { x: x - offset, y: y + halfHeight };
            const bottomCenterPoint = { x: x + halfWidth, y: y + height + offset };
            const rightCenterPoint =  { x: x + width + offset, y: y + halfHeight }

            
            const leftTopPoint =      { x: x - offset, y: y - offset };
            const leftBottomPoint =   { x: x - offset, y: y + height + offset };
            
            const rightTopPoint =     { x: x + width + offset, y: y - offset };
            const rightBottomPoint =  { x: x + width + offset, y: y + height + offset };

            points.push(centerPoint);
            points.push(topCenterPoint);
            points.push(leftCenterPoint);
            points.push(rightCenterPoint);
            points.push(bottomCenterPoint);

            points.push(leftTopPoint);
            points.push(rightTopPoint);
            points.push(leftBottomPoint);
            points.push(rightBottomPoint);
        }

        return points;
    }

    update(){
        this.points = this.generate();
    }

    renderAt(context: CanvasRenderingContext2D) {
        this.points.forEach(point => {
            context.beginPath();
            context.arc(point.x, point.y, 2, 0, 2 * Math.PI, false);
            context.fillStyle = 'magenta';
            context.strokeStyle = 'magenta';
            context.fill();
            context.stroke();
            context.closePath();
        });
    }
}