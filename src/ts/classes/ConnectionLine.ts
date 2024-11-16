import { isPointInsideRectangle, getEuclidDistance, getManhattanDistance } from "../helpers";
import PriorityHeap from "./PriorityHeap";
import ConnectionPort from "./ConnectingPort";
import Grid from "./Grid";

/**
 * Класс линии соединения.
 * Хранит начало и конец линии и промежуточные точки
 * Позволяет удобным образом создавать массив точек, обновлять линию "пути" (соденинение) и 
 */
export default class ConnectionLine {
    points: Point[];
    grid: Grid;
    endPoints: ConnectionPort[];

    constructor(startPort: ConnectionPort, endPort: ConnectionPort) {
        this.endPoints = [startPort, endPort];
        this.grid = new Grid({
            parent: this,
            gridLineColor: 'rgba(255, 255, 255, 0.1)',
            gridPointColor: 'magenta',
            gridLineThickness: 1,
        });
        this.points = this.buildPathTrace();
    }


    /**
     * Строит самый короткий путь между двумя энд поинтами.
     * Путь будет с минимальным количеством поворотов и с минимальным пройденным расстоянием
     * @returns - массив из примитивных точек
     */
    buildPathTrace(): Point[] {
        let port1 = this.endPoints[0];
        let port2 = this.endPoints[1];

        let rect1 = port1.parent;
        let rect2 = port2.parent;

        console.log(this);
        let generatedPath = this.findShortestPath(rect1, port1, rect2, port2);

        return generatedPath;
    }

    /**
     * 
     * @param rect1 
     * @param port1 
     * @param rect2 
     * @param port2 
     * @returns 
     */
    private findShortestPath(rect1: Rectangle, port1: ConnectionPort, rect2: Rectangle, port2: ConnectionPort): Point[] {
        
        return [];
    }
    
    


    updatePath() {
        this.points = this.buildPathTrace();
        this.grid.update();
    }

    renderSegmentsAt(context: CanvasRenderingContext2D) {
        let segmentNotStarted = true;

        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(100, 100, 100, 1)';

        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];

            if (segmentNotStarted) {
                context.moveTo(point.x, point.y);
                segmentNotStarted = false;
            } else {
                context.lineTo(point.x, point.y);
            }

            context.stroke();
        }

        context.closePath();
    }



    renderAt(context: CanvasRenderingContext2D) {
        // отрисовываем сначала сегменты пути
        this.renderSegmentsAt(context);
        this.grid.renderAt(context);
    }
}