
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