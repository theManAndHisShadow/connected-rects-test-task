import { drawTriangle } from "../../helpers";
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
     * @param dashed - Должна ли линия быть пунктирной
     */
    private renderConnecterSegmentAt(context: CanvasRenderingContext2D, dashed: boolean) {
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
            if(dashed) {
                context.setLineDash([5, 5]);
                context.lineDashOffset = 5;
            }

            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.stroke();
            context.closePath();

            if(dashed) context.setLineDash([]);
        });

        // устанавливаем пары "буква порта - направление указателя"
        const pointerDirection: Record<string, "right" | "down" | "left" | "up"> = {
            A: 'right',
            B: 'down',
            C: 'left',
            D: 'up',
        }

        // обходим все порты
        for(let port of this.endPoints) {
            // если порт нужного типа
            if(port.role == 'slave') {
                // рисуем указатель-треугольник ниже

                // Позиция точки на середине грани фигуры
                let position = getPoints(port)[1];

                drawTriangle(
                    context, 
                    position.x, 
                    position.y, 
                    8, 
                    8, 
                    pointerDirection[port.letter], 
                    this.color, 
                    this.color
                );
            }
        }
    }




    /**
     * Отриссовывает линию по сегментам.
     * @param context - Куда орисовать линию.
     * @param dashed - Должна ли линия быть пунктирной
     */
    private renderSegmentsAt(context: CanvasRenderingContext2D, dashed: boolean) {
        let segmentNotStarted = true;

        context.strokeStyle = this.color;
        context.lineWidth = 1;
        context.beginPath();

        if(dashed) context.setLineDash([5, 5]);

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

        if(dashed)  context.setLineDash([]);
    }
    

    
    /**
     *  Отрисовывает линию и (при необходимости) граф между 2 соединенными фигурами.
     * @param context - Куда орисовать
    */
   renderAt(context: CanvasRenderingContext2D) {
        // получаем данные по параметрам отрисовки
        const useDashedLine = JSON.parse(localStorage.getItem('useDashedLine'));
        const renderGrid = JSON.parse(localStorage.getItem('renderGrid'))

        // отрисовываем сначала сегменты пути
        this.renderSegmentsAt(context, useDashedLine);

        this.renderConnecterSegmentAt(context, useDashedLine);
        
        // если в панели справа стоит галочка 
        if(renderGrid) {
            this.graph.renderAt(context);
        }
    }
}