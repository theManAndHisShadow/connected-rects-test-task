import { isPointInsideRectangle, groupPointsBy, getByStringAddress} from "../../helpers";
import ConnectionLine from "./ConnectionLine";
import GraphNode from "./GraphNode";

interface GraphStyle {
    graphNodeRadius: number;
    graphNodeColor: string;
    graphLineColor: string;
    graphLineThickness: number;
}

interface GraphConstructorParams {
    parent: ConnectionLine; 
    graphNodeRadius: number;
    graphNodeColor: string;
    graphLineColor: string;
    graphLineThickness: number;
    
}

interface QueueItem {
    node: GraphNodeType;
    path: GraphNodeType[];
    distance: number;
    turns: number;
    direction: string | null;
}

interface PathNewMetricsObject {
    currentNode: GraphNodeType;
    neighborNode: GraphNodeType;
    newDistance: number;
    newTurns: number,
    newMidlineNodesCount: number;
}

export default class Graph {
    parent: ConnectionLine;
    nodes: GraphNodesMap;
    midline: {
        x: number;
        y: number;
    };
    lastPathData: QueueItem | null;
    style: GraphStyle;
    /**
     * 
     * Класс, который отвечает за отрисовку сетки графа.
     * Граф состоит из связанных точек (узлов). 
     * Благодаря взаимным связям, возможно проложить путь от одного узла к другому.
     * Так как граф состоит по сути из динамической, но структурно определённой сетки точек, 
     * то это позволяет находить пути между точками на несколько порядков быстрее,
     * чем если бы путь между точками пришлось бы искать иным образом.
     * 
     * @param param.parent - Владелец данного экземпляра графа (ссылка на экземляр класса 'ConnectionLine')
     * @param param.graphLineColor - цвет рёбер графа
     * @param param.graphNodeColor - цвет узлов графа
     * @param param.graphLineThickness - толщина рёбер графа
     */
    constructor(params: GraphConstructorParams) {
        this.parent = params.parent;

        this.midline = {
            x: 0,
            y: 0,
        }
        
        let rawPoints = this.generateSimpleGridPoints();
        this.nodes = this.createGraphFrom(rawPoints);
        this.lastPathData = null;

        this.style = {
            graphNodeRadius: params.graphNodeRadius,
            graphLineColor: params.graphLineColor,
            graphLineThickness: params.graphLineThickness,
            graphNodeColor: params.graphNodeColor
        }
    }



    /**
     * Генерирует массив точек по специальной "ортогональной сетке"
     * @returns массив узлов ортогональной сетки
     */
    private generateSimpleGridPoints() {
        // Возвращает позиции точек внешнего прямоугольника (прямоугольник + margin)
        const getOuterRectPoints = (rect: Rectangle, originPoint: Point) => {
            const { x, y } = originPoint;
            const { width, height } = rect.size;
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            const offset = rect.style.margin;
    
            return {
                      centerPoint: { x: x + halfWidth, y: y + halfHeight },
                   topCenterPoint: { x: x + halfWidth, y: y - offset },
                  leftCenterPoint: { x: x - offset, y: y + halfHeight },
                bottomCenterPoint: { x: x + halfWidth, y: y + height + offset },
                 rightCenterPoint: { x: x + width + offset, y: y + halfHeight },
                     leftTopPoint: { x: x - offset, y: y - offset },
                  leftBottomPoint: { x: x - offset, y: y + height + offset },
                    rightTopPoint: { x: x + width + offset, y: y - offset },
                 rightBottomPoint: { x: x + width + offset, y: y + height + offset },
            };
        };
    
        // возвращает вертикальную линию по заданному иксу
        const generateVerticalLine = (x: number, yValues: number[]) => 
            yValues.map(y => ({ x, y }));
    
        // возвращает горизонтальную лини по заданному игреку
        const generateHorizontalLine = (y: number, xValues: number[]) => 
            xValues.map(x => ({ x, y }));
    
        const rawPoints = [];
        const startPort = this.parent.endPoints[0];
        const endPort = this.parent.endPoints[1];
    
        // Создаём 4 набора точек для: 2 фигур и 2 зеракльных проекций
        const startPortOuterRectPoints = getOuterRectPoints(startPort.parent, startPort.parent.position);
        const startPortMirrorPoints    = getOuterRectPoints(startPort.parent, { x: startPort.parent.position.x, y: endPort.parent.position.y });
        const endPortOuterRectPoints   = getOuterRectPoints(endPort.parent, endPort.parent.position);
        const endPortMirrorPoints      = getOuterRectPoints(endPort.parent, { x: endPort.parent.position.x, y: startPort.parent.position.y });
    
        const startCenter = startPortOuterRectPoints.centerPoint;
        const endCenter = endPortOuterRectPoints.centerPoint;
        const centerX = Math.round((startCenter.x + endCenter.x) / 2);
        const centerY = Math.round((startCenter.y + endCenter.y) / 2);

        this.midline.x = centerX;
        this.midline.y = centerY;
    
        const graphPoints = [
            // Вертикальная срединная линия
            ...generateVerticalLine(centerX, [
                startPortOuterRectPoints.leftTopPoint.y,
                startPortOuterRectPoints.centerPoint.y,
                startPortOuterRectPoints.leftBottomPoint.y,
                centerY,
                startPortMirrorPoints.leftTopPoint.y,
                startPortMirrorPoints.centerPoint.y,
                startPortMirrorPoints.leftBottomPoint.y,
            ]),
    
            // Левая горизонтальная линия
            ...generateHorizontalLine(centerY, [
                startPortOuterRectPoints.leftTopPoint.x,
                startPortOuterRectPoints.centerPoint.x,
                startPortOuterRectPoints.rightBottomPoint.x,
            ]),
    
            // Правая горизонтальная линия
            ...generateHorizontalLine(centerY, [
                endPortOuterRectPoints.leftTopPoint.x,
                endPortOuterRectPoints.centerPoint.x,
                endPortOuterRectPoints.rightBottomPoint.x,
            ]),
        ];

        delete startPortOuterRectPoints.centerPoint;
        delete endPortOuterRectPoints.centerPoint;
    
        // добавляем все найденные точки в общий массив;
        rawPoints.push(...Object.values(startPortOuterRectPoints));
        rawPoints.push(...Object.values(startPortMirrorPoints));
        rawPoints.push(...Object.values(endPortOuterRectPoints));
        rawPoints.push(...Object.values(endPortMirrorPoints));
        rawPoints.push(...graphPoints);

        const filtredPoints = rawPoints.filter(point => {
            // Исключаем все точки, которые оказываются во время движения в зоне фигуры + отступа
            let insideRect1 = isPointInsideRectangle(point, startPort.parent, startPort.parent.style.margin - 1);
            let insideRect2 = isPointInsideRectangle(point, endPort.parent, endPort.parent.style.margin - 1);
            
            // Если проверка пройдена - добавляем точку в отфильтрованный массив
            if(!insideRect1 && !insideRect2) return point;
        });

        // Финальный штрих - сортируем точки и по иксу и по игреку
        filtredPoints.sort((a, b) => {
            if (a.x === b.x) {
                return a.y - b.y; 
            }
            return a.x - b.x; 
        });
    

        return filtredPoints;
    }




    /**
     * Создаёт "граф", соединяя все точки между собой на основе их взаимного расположения.
     * Требует на входе отсортированного одлномерного массива точек. Сортировка должна быть и по иксу и по игреку (по возростанию)
     * Возвращает объект, содержащий пару "адроес":"узел". 
     * Каждый узел содержит внутри ссылку на ближайшего соседа или null, если такового нет.
     * 
     * NB: истинно туверждение, что 2 узла на 1 линии, 
     * соединение которых привелом бы к пересечению прямоугольника, 
     * гарантированно НЕ БУДУТ связанны! 
     * 
     * Это в свою очередь позволяет избегать прохождение линии через фигуру на уровне данной структуры.
     * @argument points - Одномерный массив отсортированных точек.
     */
    private createGraphFrom(points: Point[]): GraphNodesMap {
        const graph: GraphNodesMap = {};
    
        // конечные порты (места крепления возле фигуры)
        const endPoints = this.parent.endPoints;
    
        // прямоугольники, связанные с конечными портами
        const rect1 = endPoints[0].parent;
        const rect2 = endPoints[1].parent;
    
        // локальная вспомогательная функция, для получения адреса точки (не узла!)
        const getAddress = (point: Point) => `${point.x},${point.y}`;
    
        // определяем локакьную вспомогательную функцию
        // Проверяем, разрешена ли связь между двумя точками
        // Связь будет запрещена, если середина соединения 2 любых, 
        // не важно находятся ли точки там же, где и порты, точек 
        // будет находится внутри рямоугольника
        function canConnect(p1: Point, p2: Point): boolean {
            // 1. Сначала найдём середину между двумя точками
            const midPoint: Point = {
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2
            };
    
            // 2. далеее проверим, находится ли 'midpoint' внутри 'rect1' или 'rect2'
            if (isPointInsideRectangle(midPoint, rect1) || isPointInsideRectangle(midPoint, rect2)) {
                return false; // Связь запрещена! Прерываем исполнение кода возвратом ложного значения.
            }
    
            // Связь разрешена, если исполнение сумело дойти до этого места
            return true; 
    
        }
    
        // Заполняем карту узлов 'graph' узлами на основе точек, но с пустыми связями 
        points.forEach((point) => {
            if(point.x == this.midline.x || point.y == this.midline.y) {
                graph[`${point.x},${point.y}`] = new GraphNode(point.x, point.y, 2, 'magenta', true);
            } else {
                graph[`${point.x},${point.y}`] = new GraphNode(point.x, point.y, 2, 'orange', false);
            }
        });
    
        // Группируем точки по 'y'
        // Получая множество строк
        const rows = groupPointsBy('y', points);
    
        // Устанавливаем связи, походясь по строкам
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
    
            // в каждой строке есть точки, поэтому проходимся уже по одиночным точкам
            for (let j = 0; j < row.length; j++) {
                const point = row[j];
                const nodeAddress = `${point.x},${point.y}`;
    
                // Вверх
                // Проверка и добавление связей
                if (i > 0) {
                    // пытаемся найти точку выше той, с какой мы сейчас работаем
                    const upPoint = rows[i - 1].find(p => p.x === point.x);

                    // Далее если такая точка есть И соединание РАЗРЕШЕНО
                    if (upPoint && canConnect(point, upPoint)) {
                        // Устанавливаем ссылку на эту точку
                        graph[nodeAddress].up = graph[getAddress(upPoint)]
                    }
                }
    
                // Для всех четырёх направлений схожая логика
                // Находим соседа, и если он есть, проверяем допустимость соединения

                // Вниз
                if (i < rows.length - 1) {
                    const downPoint = rows[i + 1].find(p => p.x === point.x);

                    if (downPoint && canConnect(point, downPoint)) {
                        graph[nodeAddress].down = graph[getAddress(downPoint)];
                    } 
                } 
                // Влево
                if (j > 0) {
                    const leftPoint = row[j - 1];
                    if (canConnect(point, leftPoint)) {
                        graph[nodeAddress].left = graph[getAddress(leftPoint)];
                    }
                }
    
                // Вправо
                if (j < row.length - 1) {
                    const rightPoint = row[j + 1];
                    if (canConnect(point, rightPoint)) {
                        graph[nodeAddress].right = graph[getAddress(rightPoint)];
                    }
                }
            }
        }
    
        // Возвращаем карту узлов
        return graph;
    }



    /**
     * Эвристическая функция подсчёта приблизительной стоимости маршрута (пути).
     * @param heuristica - тип эвристики
     * @param startNode - стартовый узел пути
     * @param endNode - конечный узел пути
     * @param params - метрики маршрута (пройденное расстояние, количество средтнных точек, количество поворотов).
     * @returns - итоговую стоимость.
     */
    private recalcPathCostByHeuristic(heuristic: 'shortest' | 'orthogonal', startNode: GraphNodeType, endNode: GraphNodeType, params: PathNewMetricsObject): number {
        // Перерасчёт стоимости маршрута
        let newCost = 0;
        let bonus = 0;

        const { currentNode, neighborNode, newDistance, newTurns, newMidlineNodesCount } = params; 
        const startLetter = this.parent.endPoints[0].letter;
        const endLetter = this.parent.endPoints[1].letter;
        const isTurnsToStart = getByStringAddress(currentNode) == getByStringAddress(startNode) && neighborNode.isMidlineNode;
        const isMidlineMoving = currentNode.isMidlineNode && neighborNode.isMidlineNode;
        const isTurnsToFinish = currentNode.isMidlineNode && getByStringAddress(neighborNode) == getByStringAddress(endNode);

        if(heuristic === 'orthogonal') {
            if (isTurnsToStart || isMidlineMoving || isTurnsToFinish) {
                bonus = -1000;
            } else {
                bonus = 3000;
            }
    
            if (startLetter === endLetter) {
                newCost = newDistance + (newTurns * 100);
            } else {
                newCost = (newDistance + (newTurns * 10)) - (newMidlineNodesCount * 7) + bonus;
            }
        } else if(heuristic === 'shortest') {
            newCost = (newDistance + (newTurns * 15));
        }

        return newCost
    }


    /**
     * Находит путь между 2 точками. Координаты точек должны "найтись" в готовом графе.
     * То есть, любые 2 произвольные точки метод связать не сможет, только узлы с аналогичными координатами.
     * В зависимости от метода поиска пути возвращает 3 возможные варианта пути: 
     * - прямой, 
     * - оптимум между длиной маршрута и количеством поворотов
     * - ортогональный путь с поворотами в середине сегмента ломанной
     * @param start - Точка старта
     * @param end - Точка финиша
     * @param pathFindingMethod - метод поиска пути
     * @returns - массив итоговый узлов для отрисовки пути
     */
    findPathBetween(start: Point, end: Point, pathFindingMethod: 'straight' | 'shortest' | 'orthogonal', ): GraphNodeType[] {
        // Находим стартовый и финишный узел
        const startNode = this.nodes[`${start.x},${start.y}`];
        const endNode = this.nodes[`${end.x},${end.y}`];

        // Если выбран метод полиска пути "прямой" - сразу возвращаем путь
        if(pathFindingMethod === 'straight') {
            return [startNode, endNode];
        }

        // Если хотя бы одна из точек на входе не соответствует координатам узлов,
        // То не удастася найти узлы на таких же координатах, а значит - нет смысла в поиске.
        // Возвращаем пустой массив и выкидываем сообщение с ошибкой в консоль.
        if (!startNode || !endNode) {
            console.error("Путь невозможен: точки старта или конца пути не найдены в графе!");
            return [];
        }
    
        // Очередь для обработки узлов
        // Изначальной очередь содержит базовый объект с ссылкой на начальный узел пути.
        // Каждый узел может быть посещён несколько раз
        const queue: {
            node: GraphNodeType;
            path: GraphNodeType[];
            distance: number;
            turns: number;
            direction: string | null;
            midlineNodesCount: number;
            cost: number;
        }[] = [{
            node: startNode,
            path: [startNode],
            distance: 0,
            turns: 0,
            direction: null,
            cost: 0,
            midlineNodesCount: 0,
        }];
    
         // Ограничиваем количество поворотов для исключения ситуаций с лишними поворотами
        const maxTurns = 4;

        // Для повышения гибксти поиска разрешаем посещать один и тот же узел несколько раз
        const maxVisits = 5;

        // Сколько раз каждый уцзел (адрес узла - строка) можно посетить раз (количество посещений - число)
        const visitedCount: Record<string, number> = {};

        // Объясняем методу какие направления считаются противоположными
        const oppositeDirection: Record<string, string> = {
            up: "down",
            down: "up",
            left: "right",
            right: "left",
        };
        
    
        // Работаем пока в очереди есть маршруты
        while (queue.length > 0) {
            // Сортируем по стоимости маршрута. То есть чем дешевле маршрут, тем он первее в очереди
            queue.sort((a, b) => a.cost - b.cost);

            // Извлекаем наиболее оптимальный узел, то есть тот,
            // Который содержит самый корткий путь и наименьшее количество поворотов.
            // Так как сортировка распологает такие точки в самое начало (сортировка по возрастанию)
            // Можно просто достать 1 элемент очереди
            const current = queue.shift()!;
            const { node, path, distance, turns, direction, cost, midlineNodesCount } = current;
    
            // Если текущий узел по адресу совпал с финишным - значит мы пришли к финишу
            if (getByStringAddress(node) === getByStringAddress(endNode)) {
                // записываем данные всего маршрута в специальную переменную
                this.lastPathData = current;

                // возвращаем только точки маршрута
                return path;
            }
    
            // Пропуск кода далее если уже повернули больше, чем можно
            if (turns > maxTurns) continue;
    
            // Если же предыдущее условие не сработало, то процесс поиска продалжается
            // Получаем ссылки на соседей или null, если ссылки нет (такое бывае, если узел рядом с краем графа или рядом с фигурой)
            const neighbors: Partial<Record<string, GraphNodeType | null>> = {
                up: node.up,
                down: node.down,
                left: node.left,
                right: node.right,
            };

             //  Проходимся по всем направлениям и по всем соседям
            for (const [dir, neighbor] of Object.entries(neighbors)) {
                // Если сосед ненулевой
                if (neighbor) {
                    // Получаем ссылку на соседа
                    const neighborAddress = getByStringAddress(neighbor);
    
                    // обновляем счётчик посещений узла
                    visitedCount[neighborAddress] = (visitedCount[neighborAddress] || 0) + 1;

                    // пропускаем код ниже, если количество посещений узла превышено
                    if (visitedCount[neighborAddress] > maxVisits) continue;
    
                    // пропуск кода ниже, если движение совершается в обратную сторону
                    if (direction !== null && dir === oppositeDirection[direction]) continue;
    
                    // Обновляем метрики маршрута
                    const newDistance = distance + Math.abs(neighbor.x - node.x) + Math.abs(neighbor.y - node.y);
                    const newTurns = direction === null || direction === dir ? turns : turns + 1;
                    const newMidlineNodesCount = current.node.isMidlineNode ? midlineNodesCount + 1 : midlineNodesCount;
    
                    // Добавляем соседа в очередь на провероку
                    // Это не гарантирует что он будет именно следующей точкой
                    // Всё зависит от стоимости маршрута, от этого значения отталкивается сортировка и завасит то
                    // Каким по счёту будет маршрут в очереди
                    queue.push({
                        node: neighbor,
                        path: [...path, neighbor],
                        distance: newDistance,
                        turns: newTurns,
                        direction: dir,
                        midlineNodesCount: newMidlineNodesCount,

                        // Самый важный этап - тип подсчёта стоимости
                        // Нам нужно сделать так, чтобы оптимальные пути стоили дёшево
                        // Данный метод учитывает различные параметры текущего состояния,
                        // в зависимости от типа эвристики рассчитывает приблизительную стоимость пути
                        cost: this.recalcPathCostByHeuristic(pathFindingMethod, startNode, endNode, {
                            currentNode: node,
                            neighborNode: neighbor,
                            newDistance,
                            newTurns,
                            newMidlineNodesCount,
                        }),
                    });
                }
            }
        }
    
        console.error("Путь не найден.");
        return [];
    }


    /**
     * Отрисовка узлов графа и рёбер
     * @param context - Контекст, где нужно рисовать
     */
    renderAt(context: CanvasRenderingContext2D) {
        // Проверяем, есть ли узлы для отрисовки
        if (Object.values(this.nodes).length < 2) return;

        context.strokeStyle = this.style.graphLineColor;
        context.lineWidth = this.style.graphLineThickness;

        let allNodes = Object.values(this.nodes);

        // Рисуем рёбра графа
        allNodes.forEach(node => {
            // Рисуем "нижнее" ребро, если есть нижний сосед.
            if (node.down) {
                context.beginPath();
                context.moveTo(node.x, node.y);
                context.lineTo(node.down.x, node.down.y);
                context.stroke();
                context.closePath();
            }

            // Рисуем "правое" ребро, если есть правый сосед.
            if (node.right) {
                context.beginPath();
                context.moveTo(node.x, node.y);
                context.lineTo(node.right.x, node.right.y);
                context.stroke();
                context.closePath();
            }
        });

        // Рисуем узлы графа.
        allNodes.forEach(node => {
            //@ts-ignore
            node.renderAt(context);
        });
    }

}