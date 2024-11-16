import InteractiveCanvas from "./InteractiveCanvas";
import RectangleShape from "./Rectangle";
import Grid from "./Grid";

/**
 * Класс слоя холста.
 */
export default class Layer {
    parent: InteractiveCanvas;
    body: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    children: RectangleShape[];
    grid: Grid;

    uniqueIDs = new Set();

    constructor(parent: InteractiveCanvas, className: string){
        this.parent = parent;

        // Подготавливаем тело холста, задавая ширину и высоту, а также css-класс
        const layerCanvas = document.createElement('canvas');
              layerCanvas.width = this.parent.width;
              layerCanvas.height = this.parent.height;
              layerCanvas.classList.add(className);

        // определяем тело холста и контекст
        this.body = layerCanvas;
        this.context = layerCanvas.getContext('2d');

        // Если по какой-то причине, layerCanvas.getContext('2d') вернёт null, то вручную выкидываем ошибку
        if (!this.context) {
            throw new Error("Failed to get 2D drawing context.");
        }

        // Каждый слой хранит массив с фигурами, 
        // который она потом будет сама отрисовывать через вызов у каждой фигуры своего метода .renderAt()
        this.children = [];

        this.grid = new Grid(this);
    }

    /**
     * Возвращает уникалный ID
     * @returns 
     */
    private getUniqueID():number {
        let id;

        do {
            id = Math.floor(Math.random() * 10000) + 1;
        } while (this.uniqueIDs.has(id));

        this.uniqueIDs.add(id);

        return id;
    }

    /**
     * Вспомогательный метод класса. Позволяет быстро залить весь слой нужным цветом.
     * @param color - цвет заливки.
     */
    fill(color: string){
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.parent.width, this.parent.height);
    }

    /**
     * Добавляет заданую фигуру на слой.
     * @param children - фигура
     */
    appendChild(children: RectangleShape){
        children.id = this.getUniqueID();

        this.children.push(children);

        // обновляем состояние сетки после добавления новой фигуры
        this.grid.update();
    }

    /**
     * Главный метод класса.
     * Очищает слой и отрисовывает каждый элемент из своего массива children
     */
    render(){
        this.context.clearRect(0, 0, this.parent.width, this.parent.height);

        for(let child of this.children) {
            child.renderAt(this.context);
        }

        this.grid.renderAt(this.context);
    }
}