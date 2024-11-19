import { changeColorOpacity } from "../../helpers";
import RectangleShape from "./Rectangle";
import SynteticEventTarget from "./SynteticEventTarget";

/**
 * Базовый класс геометрического примитива. 
 * Даёт начало для всех фигур в проекте.
 */
export default class PrimitiveShape extends SynteticEventTarget implements GeometricPrimitive {
    position: Point;
    size: Size;
    style: Style;
    id: number | null;

    constructor(params: GeometricPrimitive){
        super();

        // определяем те свойства, которые могут не указываться явнр
        params.id = params.id ?? null; // null потому что без добавления в слой на InteractiveCanvas id не генерируется и явняется пустым значением
        params.style.margin = params.style.margin ?? 10; 

        Object.assign(this, params);

        // пока объект не добавлен в конкретный слой - id пустое значение
        this.id = null;

        // Тут мы сохраняем 2 взаимно исключающих события, котоыре позволяют событиям mouseover и mouseout срабатывать корректно
        
    }

    /**
     * Метод, изменяющий прозрачность фигуры.
     * @param opacity 
     */
    updateOpacity(opacity: number){
        this.style.fillColor = changeColorOpacity(this.style.fillColor, opacity);
        this.style.borderColor = changeColorOpacity(this.style.borderColor, opacity);
    }

    /**
     * Проверяет пересечение данной фигуры с остальныеми фигурами из заданной выборки (исключая себя, если она оказывается в этой выборке)
     * @param shapes 
     * @returns - возвращает истину, если фигура пересекается
     */
    isIntersectsWith(shapes: PrimitiveShape[] | RectangleShape[]): boolean{
        let offset = this.style.margin * 2; 

        for(let shape of shapes) {
            const intersects = this.position.x + this.size.width + offset >= shape.position.x &&
            this.position.x - offset <= shape.position.x + shape.size.width &&
            this.position.y + this.size.height + offset >= shape.position.y  &&
            this.position.y - offset <= shape.position.y + shape.size.height

            if(intersects) return true;
        }

        return false
    }

    /**
     * Прототипный метод отрисовки.
     * @param canvas 
     */
    renderAt(canvas: CanvasRenderingContext2D){
        // prototype method
    }
}