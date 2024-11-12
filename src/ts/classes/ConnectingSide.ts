export default class ConnectionSide {
    cx: number;
    cy: number;
    r: number;
    parent: Rectangle;
    letter: string;
    isBusy: boolean;

    constructor(params: {letter: string, cx: number, cy: number, r: number, parent: Rectangle}){
        Object.assign(this, params);

        this.isBusy = false;
    }

    renderAt(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.arc(this.cx, this.cy, this.r, 0, 2 * Math.PI, false);
        context.fillStyle = this.parent.style.fillColor;
        context.strokeStyle = this.parent.style.borderColor;
        context.fill();
        context.closePath();
        context.stroke();
    }
}