import ConnectionPort from "./ConnectingPort";
import PrimitiveShape from "./Primitive";

interface PortsMap {
    [key: string]: ConnectionPort,
}

export default class RectangleShape extends PrimitiveShape implements Rectangle {
    position: Point;
    size: Size;
    style: Style;
    ports: PortsMap;

    constructor(params: Rectangle){
        super(params);

        Object.assign(this, params);

        this.ports = {
            // Я вынес порты за границу прямоугольника используя 'this.style.margin' ввиду бага (пока не исправлено)
            A: new ConnectionPort({ letter: 'A', parent: this, angle: 180, r: 3, x: this.position.x - this.style.maring,  y: this.position.y + (this.size.height / 2) }),
            B: new ConnectionPort({ letter: 'B', parent: this, angle: 90, r: 3, x: this.position.x + (this.size.width / 2),  y: this.position.y - this.style.maring}),
            C: new ConnectionPort({ letter: 'C', parent: this, angle: 0, r: 3, x: this.position.x + this.size.width + this.style.maring,  y: this.position.y + (this.size.height / 2) }),
            D: new ConnectionPort({ letter: 'D', parent: this, angle: 270, r: 3, x: this.position.x + (this.size.width / 2),  y: this.position.y + this.size.height + this.style.maring}),
        };
    }

    moveTo(newX: number, newY: number){
        let dx = this.position.x - newX;
        let dy = this.position.y - newY;


        // Логика проста:
        // - прямоугольник знает, что у него поменялись координаты
        // - прямоугольник знает свои порты
        // - прямоугольник знает какой у него порт занят
        // - а значит - вызываем перерисовку соеднения с учётом новых состояний (координат)
        Object.values(this.ports).forEach(port => {
            port.connectionPoint.point.x -= dx;
            port.connectionPoint.point.y -= dy;

           if(port.isBusy) {
                port.reconnect();
           }
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

        Object.values(this.ports).forEach(sidePoint => {
            sidePoint.renderAt(context);
        })
    }
}