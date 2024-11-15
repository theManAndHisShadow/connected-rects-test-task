import { isPointInsideRectangle, getEuclidDistance, getManhattanDistance } from "../helpers";
import PriorityHeap from "./PriorityHeap";
import ConnectionPort from "./ConnectingPort";

/**
 * Класс линии соединения.
 * Хранит начало и конец линии и промежуточные точки
 * Позволяет удобным образом создавать массив точек, обновлять линию "пути" (соденинение) и 
 */
export default class ConnectionLine {
    points: Point[];
    endPoints: ConnectionPort[];

    constructor(startPort: ConnectionPort, endPort: ConnectionPort) {
        this.endPoints = [startPort, endPort];
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
        // локальная вспомогательная функция
        const moveInDirection = (point: Point, direction: string, step: number = 10): Point => {
            let newPoint = { x: point.x, y: point.y };

            switch (direction) {
                case 'up':
                    newPoint.y -= step;
                    break;
                case 'down':
                    newPoint.y += step;
                    break;
                case 'left':
                    newPoint.x -= step;
                    break;
                case 'right':
                    newPoint.x += step;
                    break;
                default:
                    throw new Error("Invalid direction: direction must be 'up', 'down', 'left', or 'right'");
            }

            return newPoint;
        }

        // локальная вспомогательная функция
        const getInitialDirection = (port1: Point, port2: Point): 'up' | 'down' | 'left' | 'right' => {
            const dx = port2.x - port1.x;
            const dy = port2.y - port1.y;

            // Если абсолютное значение dx больше, значит порты расположены горизонтально друг от друга
            if (Math.abs(dx) > Math.abs(dy)) {
                return dx > 0 ? 'right' : 'left';
            }
            // Иначе порты расположены вертикально друг от друга
            else {
                return dy > 0 ? 'down' : 'up';
            }
        }

        // Ещё не проверенные точки
        const notVisited = new PriorityHeap<{
            point: Point;
            direction: 'up' | 'down' | 'left' | 'right';
            path: Point[];
            turns: number;
            length: number;
        }>();

        // Уже ранее проверенные точки
        const visited = new Set<string>();

        // записываем в очередь 1 точку - точку порта
        notVisited.enqueue({
            point: port1.connectionPoint.point,
            direction: getInitialDirection(port1.connectionPoint.point, port2.connectionPoint.point),
            path: [port1.connectionPoint.point],
            turns: 0,
            length: 0,
        }, 0);

        // если ещё есть точки к проверке - выполнить код алгоритма
        while (!notVisited.isEmpty()) {
            // достаём точку из очереди
            const current = notVisited.dequeue();
            
            // Чтобы алгоритм работал быстрее и было меньше точек для проверки
            // Устанавливаем значение погрешности
            // то есть каждый раз новая точка будет на расстоянии 5 пикс 
            // и посл точка пути может не попадать в точку порта аж на целых 5 пикс 
            // поэтому лучше найти более точное решение
            const tolerance = 5; 

            // если текущая точка попала в цель с погрешностью - значит мы прибыли к цели
            // Поэтому возвращаем весь пройденный путь
            if (Math.abs(current.point.x - port2.connectionPoint.point.x) <= tolerance &&
                Math.abs(current.point.y - port2.connectionPoint.point.y) <= tolerance
            ) {
                return current.path;
            }

            // Если не попали - значит точку уже проверили и можно добавить в проверенные
            visited.add(`${current.point.x},${current.point.y}`);

            // движемся по 4 направлениям
            for (let direction of ['up', 'down', 'left', 'right'] as const) {
                // создаём точку с отступом в tolerance и движемся в каком-то направлении
                const nextPoint = moveInDirection(current.point, direction, tolerance);

                // если точка имеет такие же координаты что и точки из просещенных
                // или точка внутри одного из прямоугольникв (с учётом отступа из класса PrimitiveShape)
                if (visited.has(`${nextPoint.x},${nextPoint.y}`) ||
                    isPointInsideRectangle(nextPoint, rect1, rect1.style.maring) ||
                    isPointInsideRectangle(nextPoint, rect2, rect2.style.maring)
                ) {
                    // то пропускаем данный цикл и переходим к следующему
                    continue;
                }

                // если же точка новая и не находится в запретной зоне
                // то подготавливаем ряд переменных
                const isTurn = current.direction !== direction;
                const newTurns = current.turns + (isTurn ? 1 : 0);
                const newLength = current.length + getEuclidDistance(current.point, nextPoint);
                const newPath = [...current.path, nextPoint];

                // самая важная переменная приоритет, по сути вес, 
                // на основе которого и выбирается самый короткий маршрут (с минимальным количеством поворотов)
                const priority = newLength + (newTurns * 5) + getManhattanDistance(nextPoint, port2.connectionPoint.point);

                // добавляем не посещённую точку
                notVisited.enqueue({
                    point: nextPoint,
                    direction,
                    path: newPath,
                    turns: newTurns,
                    length: newLength,
                }, priority);
            }
        }

        // В самом худшем сценарии - вернём пустой массив
        return [];
    }


    updatePath() {
        this.points = this.buildPathTrace();
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
    }
}