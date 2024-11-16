
/**
 * Вспомогательная функция, которая рисует сетку с заданными параметрами.
 * @param context - контекст, где сетку необходимо отрисовать
 * @param params - размер ячейки сетки, толщина линии сетки, цвет линии сетки
 */
export function drawGrid(context: CanvasRenderingContext2D, params: {gridSize: number, gridLineThickness: number, gridLineColor: string}): void{
    const { width, height } = context.canvas;

    context.strokeStyle = params.gridLineColor;
    context.lineWidth = params.gridLineThickness;

    // single 'beginPath'call - faster result
    context.beginPath();

    // draw a vertical and horizontal lines
    for (let x = 0; x <= width; x += params.gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += params.gridSize) {
        context.moveTo(0, y);
        context.lineTo(width, y);
    }

    context.stroke();
}



/**
 * Вспомогательная функция, которая позволяет получить rgba-код цвета по названию.
 * @param name - название цвета
 * @returns 
 */
export function getColor(name: string): string {
    // Создаём локальный интерфейс для хранения пар "ключ (название цвета): код цвета (rgba)"
    interface colorStorage {
        [key: string]: string,
    }

    const colors: colorStorage = {
        carbon:      'rgba(14, 14, 14, 1)',
        darkRed:     'rgba(38, 12, 12, 1)',
        brightRed:   'rgba(114, 6, 6, 1)',

        darkBlue:    'rgba(12, 16, 38, 1)',
        brightBlue:  'rgba(9, 12, 104, 1)',

        darkGreen:   'rgba(12, 38, 12, 1)',
        brightGreen: 'rgba(6, 114, 6, 1)',
    }

    return colors[name];
}



/**
 * Вспомогательная функция, которая изменяет прозрачность заданного rgba-цвета
 * @param rgba - код цвета в формате rgba
 * @param newOpacity - новое значение прозрачности
 * @returns 
 */
export function changeColorOpacity(rgba: string, newOpacity: number): string{
    // Ограничиваем значение на входе между 0 и 1 (нормализуем)
    newOpacity = Math.max(0, Math.min(newOpacity, 1));

    // Разделим цвет на компонентs, берём последний компонент (альфа-канал) и изменяем его
    // перед тем как вернуть - склаиваем массив каналов обратно в строку
    return rgba.split(', ').map((c, i) => { if(i == 3) c = newOpacity + ')'; return c;}).join(', ');
}



/**
 * Вспомогательная функция, которая возвращает объект с позицией курсора мыши относительно холста.
 * @param canvas - холст, относительно которого движдется мышь
 * @param event - объект события, в котором хранится инфо о позиции курсора
 * @returns 
 */
export function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent): {x: number, y: number} {
    let rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}



/**
 * Вспомогательная функция, которая позволяет проверить находится ли заданная точка внутри прямоугольника.
 * @param point - целевая точка
 * @param rect - прямоугольник,в котором нужно проверит нахождление точки
 * @param margin - отступы от прямоугольника, нахождения в которых так же будет считаться нарушением
 * @returns 
 */
export function isPointInsideRectangle(point: Point, rect: Rectangle, margin: number = 0): boolean {
    const isIntersects = 
        point.x >= rect.position.x - margin && 
        point.x <= rect.position.x + rect.size.width + margin &&
        point.y >= rect.position.y - margin && 
        point.y <= rect.position.y + rect.size.height + margin;

    return isIntersects;
}

/**
 * Вспомогательная функция, которая позволяет проверить находится ли заданная точка внутри окружности
 * @param x - икс позиция точки
 * @param y - игрек позиция точки
 * @param cx - икс позиция центра окружности
 * @param cy - игрек позиция центра окружности
 * @param r - радиус окружности
 * @returns 
 */
export function isPointInsideCircle(x: number, y: number, cx: number, cy: number, r: number): boolean {
    // Сравниваем квадрат расстояния с квадратом радиуса
    const distanceSquared = (x - cx) ** 2 + (y - cy) ** 2;
    const radiusSquared = r ** 2;
    
    return distanceSquared <= radiusSquared;
}


/**
 * Вспомогательная функция, которая возвращает расстояние между 2 точками (евклидова дистанция)
 * @param pointA 
 * @param pointB 
 * @returns 
 */
export function getEuclidDistance(pointA: Point, pointB: Point): number{
    // first short side of triangle
    let a = pointA.x - pointB.x;

    // second short side of triangle
    let b = pointA.y - pointB.y;
    
    // if we know the two sides of a triangle, we can also calculate the long side - the hypotenuse
    let hypotenuse = Math.sqrt((a * a) + (b * b));

    return hypotenuse;
}




/**
 * Вспомогательная функция, которая возвращает расстояние между 2 точками (манхэттенская дистанция).
 * Манхэттенская дистанция (или дистанция городских кварталов) измеряет расстояние между двумя точками на плоскости, 
 * двигаясь только по вертикали и горизонтали, как по улицам города, где нельзя двигаться по диагоналям. 
 * Евклидова дистанция измеряет прямое расстояние между точками по прямой линии, независимо от сетки, и рассчитывается по теореме Пифагора.
 * Евклидова дистанция меньше или равна манхэттенской дистанции, так как она измеряет "кратчайший путь" между точками.
 * @param pointA 
 * @param pointB 
 * @returns 
 */
export function getManhattanDistance(pointA: Point, pointB: Point): number {
    return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}