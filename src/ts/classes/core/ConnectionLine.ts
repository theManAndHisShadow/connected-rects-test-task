import ConnectionPort from "./ConnectingPort";
import Graph from "./Graph";

export default class ConnectionLine {
    endPoints: ConnectionPort[];
    points: Point[];
    graph: Graph;
    color: string;


    /**
     * Класс линии соединения.
     * Хранит начало и конец линии и промежуточные точки.
     * Так же хранит вспомогательный "граф" c узлами, на основе которых и строится линия.
     */
    constructor(startPort: ConnectionPort, endPort: ConnectionPort, color: string) {
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

        this.color = color;
    }



    /**
     * Отрисовывает маленький сегмент от самого края фигуры до порта.
     * @param context - Контекст, где происходит отрисовка
     */
    private renderConnecterSegmentAt(context: CanvasRenderingContext2D) {
        // если по какой-то причине порт недействителен - прервать выполнение
        if (!this.endPoints[0] || !this.endPoints[1]) {
            console.error('Один из портов пустой! Массив текущих значений: ', this.endPoints);

            return false;
        }; 

        // Устанавливаем стиль отрисовки такой же, как и основной линии
        context.strokeStyle = this.color;
        context.lineWidth = 1;

        // Получить точки откуда до куда нужна отрисовка
        const getPoints = (port: ConnectionPort) => {
            // Первая точка - всегда порт
            const points: Point[] = [port.connectionPoint.point];
            const rect = port.parent;

            // В зависимости от порта, формируем вторую точку
            if(port.letter === 'A') {
                points.push({
                    x: rect.position.x - 1,
                    y: rect.position.y + (rect.size.height / 2),
                });
            } else if(port.letter === 'B') {
                points.push({
                    x: rect.position.x + (rect.size.width / 2),
                    y: rect.position.y - 1,
                });
            } else if(port.letter === 'C') {
                points.push({
                    x: rect.position.x + rect.size.width + 1,
                    y: rect.position.y + (rect.size.height / 2),
                });
            } else if(port.letter === 'D') {
                points.push({
                    x: rect.position.x + (rect.size.width / 2),
                    y: rect.position.y + 1,
                });
            }

            return points;
        }

        // получаем пары точек для эндопинов
        const points: Point[][] = this.endPoints.map(port => getPoints(port));

        // отрисовываем в цикле от start до end пар
        points.forEach(([start, end]) => {
            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.stroke();
            context.closePath();
        });
    }




    /**
     * Отриссовывает линию по сегментам.
     * @param context - Куда орисовать линию.
     */
    private renderSegmentsAt(context: CanvasRenderingContext2D) {
        let segmentNotStarted = true;

        context.strokeStyle = this.color;
        context.lineWidth = 1;
        context.beginPath();

        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];

            if (segmentNotStarted) {
                context.moveTo(point.x, point.y);
                segmentNotStarted = false;
            } else {
                context.lineTo(point.x, point.y);
            }

        }
        
        context.stroke();
        context.closePath();

    }
    

    
    /**
     *  Отрисовывает линию и (при необходимости) граф между 2 соединенными фигурами.
     * @param context - Куда орисовать
    */
   renderAt(context: CanvasRenderingContext2D) {
        // отрисовываем сначала сегменты пути
        this.renderSegmentsAt(context);

        this.renderConnecterSegmentAt(context);
        
        // если в панели справа стоит галочка 
        if(JSON.parse(localStorage.getItem('renderGrid'))) {
            this.graph.renderAt(context);
        }
    }
}