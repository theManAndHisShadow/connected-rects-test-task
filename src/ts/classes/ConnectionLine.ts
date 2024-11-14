import ConnectionPort from "./ConnectingPort";

/**
 * Класс линии соединения.
 * Хранит начало и конец линии и промежуточные точки
 * Позволяет удобным образом создавать массив точек, обновлять линию "пути" (соденинение) и 
 */
export default class ConnectionLine {
    points: Point[];
    endPoints: ConnectionPort[];
    maring: number;

    constructor(startPort: ConnectionPort, endPort: ConnectionPort){
        this.endPoints = [startPort, endPort];
        this.maring = 20;
        this.points = this.buildPathTrace();
    }

    // прототип метода
    buildPathTrace(): Point[] {
        return [this.endPoints[0].connectionPoint.point];
    }
    

    updatePath(){
        this.points = this.buildPathTrace();
    }

    renderSegmentsAt(context: CanvasRenderingContext2D){
        let segmentNotStarted = true;

        context.lineWidth = 1;

        for(let i = 0; i < this.points.length; i++) {
            let point = this.points[i];

            if(segmentNotStarted) {
                context.moveTo(point.x, point.y);
                segmentNotStarted = false;
            } else {
                context.lineTo(point.x, point.y);
            }

            context.stroke();
        }
    }

    renderAt(context: CanvasRenderingContext2D) {
        // отрисовываем сначала сегменты пути
        this.renderSegmentsAt(context);

        // далее отрисовываем точки пути
        this.points.forEach(connection => {
            context.beginPath();
            context.arc(connection.x, connection.y, 3, 0, 2 * Math.PI, false);
            context.fillStyle = "red";
            context.strokeStyle = "white";
            context.fill();
            context.closePath();
            context.stroke();
        });
    }
}