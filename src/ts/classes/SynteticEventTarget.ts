// Так как события мыши - сложная штука
// то храним различные состояния в отдельном хранилище
interface MouseEventStorage {
    mouseout: boolean;
    mouseover: boolean;
    mousedown: boolean;
    mouseup: boolean;
    mousemove: boolean;
    hoveron: boolean;
    hoveroff: boolean;
    drag: boolean;
}


/**
 * Класс синтетических событий. 
 * Добавляет некотору реактивность, позволяя избегать callback-hell
 */
export default class SynteticEventTarget {
    events: ShapeEventStorage;
    eventStates: MouseEventStorage;

    constructor() {
        // тут мы храним пары "название события": "массив с функциями обратного вызова"
        this.events = {};

        // храним значения по событиям мыши для быстрого доступа к состоянию события
        this.eventStates = {
            mouseout: false,
            mouseover: false,
            mouseup: true,
            mousedown: false,
            mousemove: false,
            hoveron: false,
            hoveroff: false,
            drag: false,
        }
    }

    /**
     * Добавляет событие к цели.
     * @param eventName - название события (схожи с названиями событий из vanilla js)
     * @param callback - фукнция обратного вызова
     */
    addEventListener(eventName: string, callback: (data: any) => void) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        
        this.events[eventName].push(callback);
    }

    /**
     * Вызывает callback для заданного события.
     * @param eventName - название события (схожи с названиями событий из vanilla js)
     * @param data - передаваемый объект, доступный внутри callback как 'event'
     */
    dispatchEvent(eventName: string, data: any) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}
