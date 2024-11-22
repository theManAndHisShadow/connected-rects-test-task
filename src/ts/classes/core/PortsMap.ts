import Port from "./Port";

export default class PortsMap {
    private ports: Map<string, Port>;

    constructor(ports: { [key: string]: Port }){
        this.ports = new Map(Object.entries(ports));
    }



    /**
     * Позволяет переместить сразу все порты.
     * @param dx - смещение по иксу
     * @param dy - смещение по игреку
     */
    moveAll(dx: number, dy: number){
        const ports = this.getAll();

        ports.forEach(port => {
            port.connectionPoint.point.x += dx;
            port.connectionPoint.point.y += dy;
        });

        ports.filter(port => port.isBusy).forEach(port => port.reconnect());
    }



    /**
     * Возвращает порт с указанной буквой
     * @param name - Буква порта
     * @returns - порт, принадлежащий к фигуре
     */
    getPort(name: string): Port | undefined {
        return this.ports.get(name);
    }



    /**
     * Возвращает массив всех портов данной фигуры
     * @returns 
     */
    getAll(): Port[] {
        return Array.from(this.ports.values());
    }



    /**
     * Скрывает все порты данной фигуры разом
     */
    hideAll() {
        this.getAll().forEach(port => port.style.visibility = false);
    }


    /**
     * Возвращает видимость всех портов данной фигуры разом
     */
    showAll() {
        this.getAll().forEach(port => port.style.visibility = true);
    }
}