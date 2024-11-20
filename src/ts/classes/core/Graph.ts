import { isPointInsideRectangle, groupPointsBy} from "../../helpers";
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

export default class Graph {
    parent: ConnectionLine;
    nodes: GraphNodesMap;
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
        
        let rawPoints = this.generateSimpleGridPoints();
        this.nodes = this.createGraphFrom(rawPoints);

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
        const centerX = (startCenter.x + endCenter.x) / 2;
        const centerY = (startCenter.y + endCenter.y) / 2;
    
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
    
        // Порты обоих прямоугольников
        const portsLocationsOfRect1: Point[] = rect1.ports.getAll().map(port => port.connectionPoint.point);
        const portsLocationsOfRect2: Point[] = rect2.ports.getAll().map(port => port.connectionPoint.point);
    
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
            graph[`${point.x},${point.y}`] = new GraphNode(point.x, point.y, 2, 'orange');
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
     * Находит путь между 2 точками. 
     * На данный момент самый возвращается самый короткий путь с наименьшим количеством точек.
     * 
     * N.B: В качестве стартовой и финишной точки разрешены лишь те точки, 
     * координаты которых СОВПАДАЮТ с координатами узлов графа. Иначе вёрнёт пустой массив.
     *
     * @param start - Точка старта. 
     * @param end - Точка финиша.
     * @returns - Массив с узлами, через которых проходит путь, а если путь не найден - пустой массив.
     */
    findPathBetween(start: Point, end: Point): GraphNodeType[] {
        // Формат ключа для удобства обращения к узлам
        const getKey = (node: GraphNodeType) => `${node.x},${node.y}`;
    
        // Находим стартовый и финишный узел
        const startNode = this.nodes[`${start.x},${start.y}`];
        const endNode =  this.nodes[`${end.x},${end.y}`];
    
        // Если хотя бы одна из точек на входе не соответствует координатам узлов,
        // То не удастася найти узлы на таких же координатах, а значит - нет смысла в поиске.
        // Возвращаем пустой массив и выкидываем сообщение с ошибкой в консоль.
        if (!startNode || !endNode) {
            console.error("Путь невозможен: точки старта или конца пути не найдены в графе!");
            return [];
        }
    
        // Очередь для обработки узлов
        // Изначальной очередь содержит базовый объект с ссылкой на начальный узел пути.
        const queue: {
            node: GraphNodeType;
            path: GraphNodeType[];
            distance: number;
            turns: number;
            direction: string | null;
        }[] = [{
            node: startNode,
            path: [startNode],
            distance: 0,
            turns: 0,
            direction: null, // Начального направления нет
        }];
    
        // Отслеживаем посещённые узлы
        // Структура Set позволит добавлять только те точки, которых ранее не было в ней.
        const visited = new Set<string>();

        // Добавляем стартовую точку в список посещённых, ведь с неё всё и начинается
        visited.add(getKey(startNode));
    
        // Устанавливаем противоположные направления
        // Данная структура необходима для запрета двигаться на 180 градусов, по отношению к текущей точке очереди
        const oppositeDirection: Record<string, string> = {
            up: "down",
            down: "up",
            left: "right",
            right: "left",
        };
    
        // Пока в очереди есть объекты с узлами
        // Продолжаем поиск
        while (queue.length > 0) {
            // ОСНОВНАЯ ЛОГИКА ПОИСКА
            // Сортируем очередь по количеству поворотов и длине пути
            queue.sort((a, b) => a.turns - b.turns || a.distance - b.distance);
    
            // Извлекаем наиболее оптимальный узел, то есть тот,
            // Который содержит самый корткий путь и наименьшее количество поворотов.
            // Так как сортировка распологает такие точки в самое начало (сортировка по возрастанию)
            // Можно просто достать 1 элемент очереди
            const current = queue.shift()!;

            // Вытаскиываем нужные свойства
            const { node, path, distance, turns, direction } = current;
    
            // Проверяем дстигли ли мы конца простым сравнением, так как адрес по сути строка из x,y
            if (getKey(node) === getKey(endNode)) {
                // Если адрес текущей точки совпадает полностью с адресом конечной 
                // то возвращаем текущий путь, проделанной текущей точкой (последней на момент срабатывания условия)

                console.log('Найден путь:', path);
                console.log('Оставшиеся альтернативные пути:', queue);
                return path;
            }
    
            // Если же предыдущее условие не сработало, то процесс поиска продалжается
            // Получаем ссылки на соседей или null, если ссылки нет (такое бывае, если узел рядом с краем графа или рядом с фигурой)
            const neighbors: Partial<Record<string, GraphNodeType | null>> = {
                up: node.up,
                down: node.down,
                left: node.left,
                right: node.right,
            };
    
            //  Проходимся по всем направлениям и всем соседям
            for (const [dir, neighbor] of Object.entries(neighbors)) {
                // Если ссылка на соседа существует
                if (neighbor) {
                    // То получаем адресс соседа
                    const neighborKey = getKey(neighbor);
    
                    // Далее ряд очень важных условий:
                    // 1. пропускаем уже посещённые узлы
                    if (visited.has(neighborKey)) continue;
    
                    // 2. пропускаем узел, если он в направлении, из которого пришли (запрет движения на 180 градусов)
                    if (direction !== null && dir === oppositeDirection[direction]) continue;
    
                    // Вычисляем новую длину пути как сумму уже пройденного пути и расстояния до соседа
                    const newDistance = distance + Math.abs(neighbor.x - node.x) + Math.abs(neighbor.y - node.y);
    
                    // Вычисляем количество поворотов
                    const newTurns = direction === null || direction === dir ? turns : turns + 1;
    
                    // Добавляем соседа в очередь на провероку
                    // Это не гарантирует что он будет именно следующей точкой
                    // Всё зависит от значения пройдённого им пути и количества поворотов
                    queue.push({
                        node: neighbor,
                        path: [...path, neighbor],
                        distance: newDistance,
                        turns: newTurns,
                        direction: dir,
                    });
    
                    // Отмечаем узел как посещённый, чтобы не пришлось его проверять второй раз
                    visited.add(neighborKey);
                }
            }
        }
    
        // Если путь не найден
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