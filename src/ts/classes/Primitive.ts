export default class PrimitiveShape implements GeometricPrimitive {
    position: Point;
    size: Size;
    style: Style;

    constructor(params: GeometricPrimitive){
        Object.assign(this, params);
    }

    moveTo(){

    }

    renderAt(canvas: CanvasRenderingContext2D){
        // prototype method
    }
}