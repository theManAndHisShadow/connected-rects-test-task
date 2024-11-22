import Port from "./Port";
import PortsMap from "./PortsMap";
import PrimitiveShape from "./Primitive";

export default class RectangleShape extends PrimitiveShape implements Rectangle {
    position: Point;
    size: Size;
    style: Style;
    ports: PortsMap;
    isIntersecting: boolean;

    // Удобно знать ID фигуры, с которым была ранее связь
    // В случае простого переключения порта в рамках одной фигуры 
    // помогает быстро найти фигуру и восстановить с связь с ранее связанной фигурой
    lastConnectionWith: number | null;

    constructor(params: Rectangle){
        super(params);

        Object.assign(this, params);

        this.ports = new PortsMap({
            // Я вынес порты за границу прямоугольника используя 'this.style.margin' ввиду бага (пока не исправлено)
            A: new Port({ letter: 'A', parent: this, angle: 180, r: 4, x: this.position.x - this.style.margin,  y: this.position.y + (this.size.height / 2) }),
            B: new Port({ letter: 'B', parent: this, angle: 90, r: 4, x: this.position.x + (this.size.width / 2),  y: this.position.y - this.style.margin}),
            C: new Port({ letter: 'C', parent: this, angle: 0, r: 4, x: this.position.x + this.size.width + this.style.margin,  y: this.position.y + (this.size.height / 2) }),
            D: new Port({ letter: 'D', parent: this, angle: 270, r: 4, x: this.position.x + (this.size.width / 2),  y: this.position.y + this.size.height + this.style.margin}),
        });
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

        this.ports.getAll().forEach(sidePoint => {
            sidePoint.renderAt(context);
        })
    }



    /**
     * Проверяет есть ли активное соединение у данной фигуры.
     * @returns - True - если связь есть, false - если фигура никак не связана
     */
    hasConnection(){
        return this.ports.getAll().some(port => port.isBusy === true);
    }


    // Геттеры получения 4 углов
    get left(): number {
        return this.position.x;
    }

    get right(): number {
        return this.position.x + this.size.width;
    }

    get top(): number {
        return this.position.y;
    }

    get bottom(): number {
        return this.position.y + this.size.height;
    }
}