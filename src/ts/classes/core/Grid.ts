import { isPointInsideRectangle } from "../../helpers";
import ConnectionLine from "./ConnectionLine";

export default class Grid {
    parent: ConnectionLine;
    points: Point[];
    steppings: number[];
    gridLineColor: string;
    gridPointColor: string;
    gridLineThickness: number;

    constructor({parent, gridLineColor, gridPointColor, gridLineThickness}: {parent: ConnectionLine, gridLineColor: string, gridPointColor: string, gridLineThickness: number}) {
        this.parent = parent;
        this.steppings = [];
        this.points = this.generate();
        this.gridLineColor = gridLineColor;
        this.gridLineThickness = gridLineThickness;
        this.gridPointColor = gridPointColor;
    }

    /**
     * Генерирует массив точек по специальной "ортогональной сетке"
     * @returns массив узлов ортогональной сетки
     */
    private generate() {
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
    
        const generateVerticalLine = (x: number, yValues: number[]) => 
            yValues.map(y => ({ x, y }));
    
        const generateHorizontalLine = (y: number, xValues: number[]) => 
            xValues.map(x => ({ x, y }));
    
        const points = [];
        const startPort = this.parent.endPoints[0];
        const endPort = this.parent.endPoints[1];
    
        const startPortOuterRectPoints = getOuterRectPoints(startPort.parent, startPort.parent.position);
        const startPortMirrorPoints = getOuterRectPoints(startPort.parent, { x: startPort.parent.position.x, y: endPort.parent.position.y });
        const endPortOuterRectPoints = getOuterRectPoints(endPort.parent, endPort.parent.position);
        const endPortMirrorPoints = getOuterRectPoints(endPort.parent, { x: endPort.parent.position.x, y: startPort.parent.position.y });
    
        const startCenter = startPortOuterRectPoints.centerPoint;
        const endCenter = endPortOuterRectPoints.centerPoint;
        const centerX = (startCenter.x + endCenter.x) / 2;
        const centerY = (startCenter.y + endCenter.y) / 2;
    
        const gridPoints = [
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
    
        points.push(...Object.values(startPortOuterRectPoints));
        points.push(...Object.values(startPortMirrorPoints));
        points.push(...Object.values(endPortOuterRectPoints));
        points.push(...Object.values(endPortMirrorPoints));
        points.push(...gridPoints);
    
        return points.filter(point => {
            //
            let insideRect1 = isPointInsideRectangle(point, startPort.parent, startPort.parent.style.margin - 1);
            let insideRect2 = isPointInsideRectangle(point, endPort.parent, endPort.parent.style.margin - 1);
            
            if(!insideRect1 && !insideRect2) return point;
        }).sort((a, b) => {
            if (a.x === b.x) {
                return a.y - b.y; 
            }
            return a.x - b.x; 
        });;
    }

    findShortPath(from: Point, to: Point, tolerance: number, step: number): Point[]{        
        const path: Point[] = [from];

        // проверка если точка в окрестностях другой точки
        const isWithinTolerance = (point: Point, target: Point) => {
            return Math.abs(point.x - target.x) <= tolerance && Math.abs(point.y - target.y) <= tolerance;
        };

        path.push(to);
        return path;
    }
    

    update(){
        this.points = this.generate();
    }

    /**
     * Отрисовывает сетку из горизонтальных и вертикальных линий
     * @param context 
     * @returns 
     */
    renderAt(context: CanvasRenderingContext2D) {
        if (this.points.length < 2) return;

        context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        context.lineWidth = 1;
    
        // Функции для группировки точек
        const groupBy = (points: Point[], key: 'x' | 'y') => {
            // коллекция, которая будет содержать пары "ключ : точки"
            const map = new Map<number, Point[]>();

            // проходимся по массиву точек
            points.forEach(point => {
                // получаем значение из компонента икс или игрек
                const value = point[key];

                // это значение компонента станет ключём для группировки
                // если точек с таким значением не было в хранилище 
                if (!map.has(value)) {
                    // добавить и назначить пустой массив
                    map.set(value, []);
                }

                // получаем группу точек с таким же значением и добавляем точку в эту группу
                map.get(value)!.push(point);
            });
            return map;
        };
    
        // // Горизонтальные линии
        // // группируем все точки по игреку
        // const rows = groupBy(this.points, 'y');
    
        // // рисуем все точки изз группы "строки"
        // rows.forEach(points => {
        //     context.beginPath();
        //     points.sort((a, b) => a.x - b.x); // Сортируем по x
        //     for (let i = 0; i < points.length - 1; i++) {
        //         context.moveTo(points[i].x, points[i].y);
        //         context.lineTo(points[i + 1].x, points[i + 1].y);
        //     }
        //     context.stroke();
        //     context.closePath();
        // });
    
        // // Вертикальные линии
        // // групперуем все точки по иксу
        // const columns = groupBy(this.points, 'x');

        // // рисуем все точки из группы "колонки"
        // columns.forEach(points => {
        //     context.beginPath();
        //     points.sort((a, b) => a.y - b.y); // Сортируем по y
        //     for (let i = 0; i < points.length - 1; i++) {
        //         context.moveTo(points[i].x, points[i].y);
        //         context.lineTo(points[i + 1].x, points[i + 1].y);
        //     }
        //     context.stroke();
        //     context.closePath();
        // });
    
        // Рисуем узлы (точки)
        this.points.forEach(point => {
            context.beginPath();
            context.arc(point.x, point.y, 2, 0, 2 * Math.PI, false);
            context.fillStyle = 'magenta';
            context.fill();
            context.closePath();
        });
    }
    
}