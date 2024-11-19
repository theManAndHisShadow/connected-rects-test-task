import ConnectionPort from "./ConnectingPort";
import PortsMap from "./PortsMap";
import PrimitiveShape from "./Primitive";

export default class RectangleShape extends PrimitiveShape implements Rectangle {
    position: Point;
    previousPosition: null | Point;
    size: Size;
    style: Style;
    ports: PortsMap;
    isIntersecting: boolean;

    constructor(params: Rectangle){
        super(params);

        Object.assign(this, params);

        this.previousPosition = null;
        this.isIntersecting = false;

        this.ports = new PortsMap({
            // Я вынес порты за границу прямоугольника используя 'this.style.margin' ввиду бага (пока не исправлено)
            A: new ConnectionPort({ letter: 'A', parent: this, angle: 180, r: 3, x: this.position.x - this.style.margin,  y: this.position.y + (this.size.height / 2) }),
            B: new ConnectionPort({ letter: 'B', parent: this, angle: 90, r: 3, x: this.position.x + (this.size.width / 2),  y: this.position.y - this.style.margin}),
            C: new ConnectionPort({ letter: 'C', parent: this, angle: 0, r: 3, x: this.position.x + this.size.width + this.style.margin,  y: this.position.y + (this.size.height / 2) }),
            D: new ConnectionPort({ letter: 'D', parent: this, angle: 270, r: 3, x: this.position.x + (this.size.width / 2),  y: this.position.y + this.size.height + this.style.margin}),
        })
    }

    /**
     * Двигает обхект на новые координаты, при столкновении толкает и другие объекты
     * @param newX 
     * @param newY 
     * @param intersectionTargets 
     */
    moveTo(newX: number, newY: number, intersectionTargets?: RectangleShape[]) {
        const dx = this.position.x - newX;
        const dy = this.position.y - newY;

        this.position.x = newX;
        this.position.y = newY;

        // исключаем из целей и сам объект, чтобы не было самосрабатывания
        const validTargets = intersectionTargets.filter(target => target !== this);
        if(this.isIntersectsWith(validTargets)) {
            // у всех целей (объектов которые касаются нашего) вызываем перемещение с новой координатой = координата + дельта
            validTargets.forEach(intersectingRect => {
                intersectingRect.moveTo(
                    intersectingRect.position.x - dx, 
                    intersectingRect.position.y - dy, 
                    intersectionTargets
                );
            });
        }

        this.ports.moveAll(-dx, -dy);
    }
    

    renderAt(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.style.fillColor;
        context.strokeStyle = this.style.borderColor;
        context.lineWidth = this.style.borderThickness;

        context.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        if(this.style.borderThickness > 0) context.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);

        Object.values(this.ports).forEach(sidePoint => {
            sidePoint.renderAt(context);
        })
    }
}