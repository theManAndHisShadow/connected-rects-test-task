import ConnectionPort from "./ConnectingPort";
import Graph from "./Graph";

export default class ConnectionLine {
    points: Point[];
    graph: Graph;
    endPoints: ConnectionPort[];


    /**
     * Класс линии соединения.
     * Хранит начало и конец линии и промежуточные точки.
     * Так же хранит вспомогательный "граф" c узлами, на основе которых и строится линия.
     */
    constructor(startPort: ConnectionPort, endPort: ConnectionPort) {
        this.endPoints = [startPort, endPort];

        // Создаём эземпляр класса "граф" для данной линии (соединения)
        this.graph = new Graph ({
            parent: this,
            graphNodeRadius: 2,
            graphNodeColor: 'orange',
            graphLineColor: 'rgba(255, 255, 255, 0.1)',
            graphLineThickness: 1,
        });

        // Извлекаем позиции портов для связи
        const port1 = this.endPoints[0].connectionPoint.point;
        const port2 = this.endPoints[1].connectionPoint.point;

        // Получаем массив точек самого короткого пути (и с самым наименьшим количеством поворотов) между 2 связанными портами
        this.points = this.graph.findPathBetween(port1, port2);
    }




    /**
     * Отриссовывает линию по сегментам.
     * @param context - Куда орисовать линию.
     */
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



    /**
     *  Отрисовывает линию и (при необходимости) граф между 2 соединенными фигурами.
     * @param context - Куда орисовать
     */
    renderAt(context: CanvasRenderingContext2D) {
        // отрисовываем сначала сегменты пути
        this.renderSegmentsAt(context);

        // если в панели справа стоит галочка 
        if(JSON.parse(localStorage.getItem('renderGrid'))) {
            this.graph.renderAt(context);
        }
    }
}