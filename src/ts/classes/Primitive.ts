import { changeColorOpacity } from "../helpers";
import SynteticEventTarget from "./SynteticEventTarget";

/**
 * Базовый класс геометрического примитива. 
 * Даёт начало для всех фигур в проекте.
 */
export default class PrimitiveShape extends SynteticEventTarget implements GeometricPrimitive {
    position: Point;
    size: Size;
    style: Style;
    mouseover: boolean;
    mouseout: boolean;

    constructor(params: GeometricPrimitive){
        super();

        Object.assign(this, params);

        // Тут мы сохраняем 2 взаимно исключающих события, котоыре позволяют событиям mouseover и mouseout срабатывать корректно
        this.mouseout = false;
        this.mouseover = false;
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
     * Прототипный метод отрисовки.
     * @param canvas 
     */
    renderAt(canvas: CanvasRenderingContext2D){
        // prototype method
    }
}