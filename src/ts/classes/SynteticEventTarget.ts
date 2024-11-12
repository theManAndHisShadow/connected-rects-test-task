/**
 * Класс синтетических событий. 
 * Добавляет некотору реактивность, позволяя избегать callback-hell
 */
export default class SynteticEventTarget {
    events: ShapeEventStorage;

    constructor() {
        // тут мы храним пары "название события": "массив с функциями обратного вызова"
        this.events = {};
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
