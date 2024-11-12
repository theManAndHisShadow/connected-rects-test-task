import PrimitiveShape from "./Primitive";

export default class RectangleShape extends PrimitiveShape implements Rectangle {
    position: Point;
    size: Size;
    style: Style;

    constructor(params: Rectangle){
        super(params);

        Object.assign(this, params);
    }

    renderAt(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.style.fillColor;
        context.strokeStyle = this.style.borderColor;
        context.lineWidth = this.style.borderThickness;

        context.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        if(this.style.borderThickness > 0) context.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}