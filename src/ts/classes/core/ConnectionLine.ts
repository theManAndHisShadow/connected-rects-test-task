import { drawTriangle } from "../../helpers";
import Port from "./Port";
import Graph from "./Graph";

export default class ConnectionLine {
    method: 'straight line' | 'shortest path';
    endPoints: Port[];
    points: Point[];
    graph: Graph;
    color: string;

    /**
     * Класс линии соединения.
     * Хранит начало и конец линии и промежуточные точки.
     * Так же хранит вспомогательный "граф" c узлами, на основе которых и строится линия.
     */
    constructor(startPort: Port, endPort: Port, color: string) {
        this.endPoints = [startPort, endPort];

        // Создаём эземпляр класса "граф" для данной линии (соединения)
        this.graph = new Graph ({
            parent: this,
            graphNodeRadius: 2,
            graphNodeColor: 'orange',
            graphLineColor: 'rgba(255, 255, 255, 0.1)',
            graphLineThickness: 1,
        });

        this.method = JSON.parse(localStorage.getItem('connectionMethod'));

        // Извлекаем позиции портов для связи
        const port1 = this.endPoints[0].connectionPoint.point;
        const port2 = this.endPoints[1].connectionPoint.point;

        // Определяем доступные имена методов
        let methodName: 'straight' | 'shortest' | 'orthogonal' = 'straight';

        // На основе метода указанного в конструкторе класса будут заполнены точки пути
        if(this.method === 'shortest path') {
            // Точки самого короткого пути (и с самым наименьшим количеством поворотов)
            methodName = 'shortest';
        } else if(this.method === 'straight line') {
            // Просто прямая линия
            methodName = 'straight';
        } else if(this.method === 'orthogonal (elbow)') {
            methodName = 'orthogonal';
        }

        // записываем точки пути
        this.points =  this.graph.findPathBetween(port1, port2, methodName);

        this.color = color;
    }



    /**
     * Отрисовывает маленький сегмент от самого края фигуры до порта.
     * @param context - Контекст, где происходит отрисовка
     * @param dashed - Должна ли линия быть пунктирной
     */
    private renderConnecterSegmentAt(context: CanvasRenderingContext2D, lineStyle: "solid" | "dashed" | "dots", renderPointer: boolean) {
        // если по какой-то причине порт недействителен - прервать выполнение
        if (!this.endPoints[0] || !this.endPoints[1]) {
            console.error('Один из портов пустой! Массив текущих значений: ', this.endPoints);

            return false;
        }; 

        // Устанавливаем стиль отрисовки такой же, как и основной линии
        context.strokeStyle = this.color;
        context.lineWidth = 1;

        // Получить точки откуда до куда нужна отрисовка
        const getPoints = (port: Port) => {
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
                    y: rect.position.y + rect.size.height + 1,
                });
            }

            return points;
        }

        // получаем пары точек для эндопинов
        const points: Point[][] = this.endPoints.map(port => getPoints(port));

        // отрисовываем в цикле от start до end пар
        points.forEach(([start, end]) => {
            if(lineStyle === "dashed") {
                context.setLineDash([5, 5]);
                context.lineDashOffset = 5;
            }
            
            if(lineStyle == "dots") context.setLineDash([2, 2]);

            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.moveTo(start.x, start.y);
            context.stroke();
            context.closePath();

            if(lineStyle === "solid" || lineStyle === "dashed" || lineStyle === "dots") context.setLineDash([]);
        });

        // устанавливаем пары "буква порта - направление указателя"
        const pointerDirection: Record<string, "right" | "down" | "left" | "up"> = {
            A: 'right',
            B: 'down',
            C: 'left',
            D: 'up',
        }

        if(renderPointer) {
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
    }




    /**
     * Отриссовывает линию по сегментам.
     * @param context - Куда орисовать линию.
     * @param dashed - Должна ли линия быть пунктирной
     */
    private renderSegmentsAt(context: CanvasRenderingContext2D, lineStyle: "solid" | "dashed" | "dots") {
        let segmentNotStarted = true;

        context.strokeStyle = this.color;
        context.lineWidth = 1;
        context.beginPath();

        if(lineStyle === "dashed") context.setLineDash([5, 5]);
        if(lineStyle == "dots") context.setLineDash([2, 2]);

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

        if(lineStyle === "dashed" || lineStyle === "dots")  context.setLineDash([]);
    }
    

    
    /**
     *  Отрисовывает линию и (при необходимости) граф между 2 соединенными фигурами.
     * @param context - Куда орисовать
    */
   renderAt(context: CanvasRenderingContext2D) {
        // получаем данные по параметрам отрисовки
        const renderGrid = JSON.parse(localStorage.getItem('renderGrid'));
        const renderPointer = JSON.parse(localStorage.getItem('renderLinePointer'));
        const lineStyle = JSON.parse(localStorage.getItem('lineStyle'));

        // отрисовываем сначала сегменты пути
        this.renderSegmentsAt(context, lineStyle);

        //
        this.renderConnecterSegmentAt(context, lineStyle, renderPointer);
        
        // если в панели справа стоит галочка 
        if(renderGrid) {
            this.graph.renderAt(context);
        }
    }
}