import ConnectionSide from "./ConnectingSide";
import PrimitiveShape from "./Primitive";

export default class RectangleShape extends PrimitiveShape implements Rectangle {
    position: Point;
    size: Size;
    style: Style;
    connectionSides: ConnectionSide[];

    constructor(params: Rectangle){
        super(params);

        Object.assign(this, params);

        this.connectionSides = [
            new ConnectionSide({ letter: 'A', parent: this, r: 3, cx: this.position.x,  cy: this.position.y + (this.size.height / 2) }),
            new ConnectionSide({ letter: 'B', parent: this, r: 3, cx: this.position.x + (this.size.width / 2),  cy: this.position.y}),
            new ConnectionSide({ letter: 'C', parent: this, r: 3, cx: this.position.x + this.size.width,  cy: this.position.y + (this.size.height / 2) }),
            new ConnectionSide({ letter: 'D', parent: this, r: 3, cx: this.position.x + (this.size.width / 2),  cy: this.position.y + this.size.height }),
        ];
    }

    moveTo(newX: number, newY: number){
        let dx = this.position.x - newX;
        let dy = this.position.y - newY;

        this.connectionSides.forEach(sidePoint => {
            sidePoint.cx -= dx;
            sidePoint.cy -= dy;
        });

        this.position.x = newX;
        this.position.y = newY;
    }

    renderAt(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.style.fillColor;
        context.strokeStyle = this.style.borderColor;
        context.lineWidth = this.style.borderThickness;

        context.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        if(this.style.borderThickness > 0) context.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);

        this.connectionSides.forEach(sidePoint => {
            sidePoint.renderAt(context);
        })
    }
}