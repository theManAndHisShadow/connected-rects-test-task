import Layer from "./Layer";

export default class Grid {
    points: Point[];
    parent: Layer;

    constructor(parent: Layer){
        this.parent = parent;
        this.points = [];
    }

    generate(){

    }

    renderAt(context: CanvasRenderingContext2D){

    }
}