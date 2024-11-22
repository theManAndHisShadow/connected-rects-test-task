import { drawCircle } from "../../helpers";
import ConnectionLine from "./ConnectionLine";
import RectangleShape from "./Rectangle";
import SynteticEventTarget from "./SynteticEventTarget";

export default class Port extends SynteticEventTarget {
    connectionPoint: ConnectionPoint;
    style: Style;
    r: number;
    hoverR: number;
    parent: RectangleShape;
    letter: string;
    isBusy: boolean;
    endPoint: null | Port;
    connection: ConnectionLine | null; 
    role: "master" | "slave" | null;

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

        // роль пока что устанавливаем на null
        this.role = null;
    }



    /**
     * Связывает текущий порт с другим портом на другой фигуре.
     * @param endPoint 
     */
    connectTo(endPoint: Port): void{
        // взаимно связываем эндопоинты
        this.endPoint = endPoint;
        endPoint.endPoint = this;

        this.isBusy = true;
        endPoint.isBusy = true;

        // Устанавливаем роли, от кого кому идёт связь
        // Если оба порта с нулевыми ролями - выставляем отталкиваясь от данного порта
        if(this.role === null && endPoint.role === null) {
            this.role = 'master';
            endPoint.role = 'slave';
        } else {
            // Если же хотя бы один не нул  действуем от подключаемого порта 
            // Потому что это значит что мы перепокдлючаем порт
            this.role = endPoint.role === 'slave' ? 'master' : 'slave';
        }

        // взаимно записываем ID фигры текущего порта соединения в свойства противоположно соединенных фигур
        // Таким образом даже после отсоединения мы будем знать к какой фигуре послоедний раз была привыязана фигура текущего порта
        this.parent.lastConnectionWith = endPoint.parent.id;
        this.endPoint.parent.lastConnectionWith = this.parent.id;

        this.connection = new ConnectionLine(this, this.endPoint, 'rgba(255, 255, 255, 0.5)');
        this.endPoint.connection = this.connection;
    }


    // Если есть необхоимость перерисовать соединение
    // Новое соедниение учитывает новое состояние внешней среды (новые координаты прямоугольника и порта) и создаёт новый оптимальный путь
    reconnect(){
        this.connection = new ConnectionLine(this, this.endPoint, 'rgba(255, 255, 255, 0.5)');
        this.endPoint.connection = this.connection;
    }



    /**
     * Метод отсоединения порта. 
     * @returns - возвращает порт, к которому была ранее привыязана, до разрыва соединения
     */
    disconnect(): Port{
        // записываем ссылку на противоположный конец соединения
        let disconnectedEnpoint = this.endPoint;

        // обнуляем соединение у обоих концов
        this.connection = null;
        this.endPoint.connection = null;
        
        // обнуляем ссылки на друг друга
        this.endPoint.endPoint = null;
        this.endPoint = null;

        // теперь этот полрт не занят и никакой роли не имеет
        this.isBusy = false;
        this.role = null;

        // возвращаем сохранённую ссылку на порт, с которым данный был связан
        return disconnectedEnpoint;
    }



    /**
     * Отрисовывает порт. В случае если порт имеет активное соединегние - отрисовывает и его.
     * @param context 
     */
    renderAt(context: CanvasRenderingContext2D): void {
        if (this.connection !== null) {
            this.connection.renderAt(context);
        }

        if (this.style.visibility) {
            drawCircle(
                context,
                this.connectionPoint.point.x,
                this.connectionPoint.point.y,
                this.r,
                this.isBusy ? 'rgba(0, 155, 155, 1)' : 'rgba(125, 125, 125, 1)',
                this.isBusy ? 'white' : 'rgba(155, 155, 155, 1)', 
                1
            );
        }
    }
}