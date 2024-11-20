export default class GraphNode implements GraphNodeType {
    x: number;
    y: number;
    r: number;
    color: string;
    left:  GraphNode | null;
    right: GraphNode | null;
    up:    GraphNode | null;
    down:  GraphNode | null;

    /**
     * Базовая еденица всего графа - узел.
     * Узел хранит информацию о своей позиции и соседях, с которомы связан.
     * Связь может быть равна null по определённым правилам связывания (см. 'Graph.createGraphFrom()').
     * 
     * @param param.x - Икс позиция узла
     * @param param.y - игрек позиция узла
     * @param param.r - радиус узла
     * @param param.color - цвет узла
     */
    constructor(x: number, y: number, r: number, color: string){
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;

        this.up = null;
        this.down = null;
        this.left = null;
        this.right = null;
    }

    /**
     * Отрисовывает узел.
     * @param context 
     */
    renderAt(context: CanvasRenderingContext2D){
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }
}