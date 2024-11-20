import ConnectionLine from "./ConnectionLine";
import RectangleShape from "./Rectangle";
import SynteticEventTarget from "./SynteticEventTarget";

export default class ConnectionPort extends SynteticEventTarget{
    connectionPoint: ConnectionPoint;
    style: Style;
    r: number;
    hoverR: number;
    parent: RectangleShape;
    letter: string;
    isBusy: boolean;
    endPoint: null | ConnectionPort;
    connection: ConnectionLine | null; 

    constructor(params: { letter: string, x: number, y: number, r: number, parent: RectangleShape, angle: number}) {
        super();

        this.connectionPoint = {
            point: {x: params.x, y: params.y},
            angle: params.angle,
        }
        
        this.letter = params.letter;
        this.parent = params.parent;
        this.r = params.r;
        this.hoverR = this.r * 10;

        this.isBusy = false;
        this.endPoint = null;
        this.connection = null;

        this.style = {
            visibility: false,
            fillColor: 'rgba(255, 255, 255, 0.2',
            borderColor: 'rgba(255, 255, 255, 0.2',
            borderThickness: 0,
        }
    }

    connectTo(endPoint: ConnectionPort): void{
        // взаимно связываем эндопоинты
        this.endPoint = endPoint;
        endPoint.endPoint = this;

        this.isBusy = true;
        endPoint.isBusy = true;


        this.connection = new ConnectionLine(this, this.endPoint, 'rgba(255, 255, 255, 0.5)');
        this.endPoint.connection = this.connection;
    }


    // Если есть необхоимость перерисовать соединение
    // Новое соедниение учитывает новое состояние внешней среды (новые координаты прямоугольника и порта) и создаёт новый оптимальный путь
    reconnect(){
        this.connection = new ConnectionLine(this, this.endPoint, 'rgba(255, 255, 255, 0.5)');
        this.endPoint.connection = this.connection;
    }

    renderAt(context: CanvasRenderingContext2D): void {
        if(this.connection !== null) {
            this.connection.renderAt(context);
        }

       if(this.style.visibility) {
            context.beginPath();
            context.arc(this.connectionPoint.point.x, this.connectionPoint.point.y, this.r, 0, 2 * Math.PI, false);
            context.fillStyle = this.isBusy ? 'rgba(125, 125, 125, 0.3)' : this.parent.style.fillColor;
            context.strokeStyle = this.isBusy ? 'rgba(155, 155, 155, 0.4)' : this.parent.style.borderColor;
            context.fill();
            context.stroke();
            context.closePath();
       }
    }
}