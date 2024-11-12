import { getMousePos } from "../helpers";
import RectangleShape from "./Reactangle";

/**
 * Локально определнный вспомогательный класс слоя холста.
 * Нигде более не задействуется, поэтому без директивы экспорт.
 */
class Layer {
    parent: InteractiveCanvas;
    body: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    children: RectangleShape[];

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
        this.children.push(children);
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
    }
}



/**
 * Главный класс проекта.
 * Создаёт в заданном целевом элементе (cssSelector) несколько слоев, 
 * на который ведёт отрисовку и просчёт взаимодействий.
 * Сам код взаимодействий вынесен в события для каждой фигуры (реактивный подход). 
 * Данному классу нет необходимости знать что и какие стили для каждой фигуры нужно отрисовать.
 */
export default class InteractiveCanvas {
    width: number;
    height: number;
    background: Layer;
    foreground: Layer;

    constructor(cssSelector: string, width: number, height: number){
        this.width = width;
        this.height = height;

        // Создаём 2 слоя - фон и передний план.
        // Таким образом всегда будет доступ и к разным контекстам, и возможность не перерисовывать фон каждый раз
        this.background = new Layer(this, 'app-canvas__background');
        this.foreground = new Layer(this, 'app-canvas__foreground');

        // Создаём и настраиваем элемент-контейнер
        // Важно! ширина и высота контейнера всецело зависит от того, какие будут width и height!
        const container = document.createElement('div');
            container.classList.add('app-canvas__container');
            container.appendChild(this.background.body);
            container.appendChild(this.foreground.body);
            container.style.width = `${width}px`;        // set height for flexible centrizing
            container.style.height = `${height}px`;      // set height for flexible centrizing

        // Встраиваем готовый контекйнер с холстами в корневой узел
        const appRoot = document.querySelector(cssSelector);
              appRoot.appendChild(container);
    }

    /**
     * Метод обёртка для добавления событий к переднему слою.
     * К переднему, потому что на заднем фоне не должно быть по идее никаких элементов.
     * Конечно, хорошо бы с помощью кода организовать сей момент, но пока что сам метод не позволяет нарушить данную условность.
     * @param triggerName 
     * @param callback 
     */
    addEventListener(triggerName: string, callback: (event: Event | MouseEvent) => void): void{
        this.foreground.body.addEventListener(triggerName, event => {
            callback(event);
        });
    }

    /**
     * Метод просчёта пересечений фигур с указателем мыши.
     * Пока что реализован с учётом прямоуголльников, а методы расчёта для разных фигур будут релаизованы в будущем.
     * @param event - событие мыши
     */
    processIntersectionsWithMouse(event: MouseEvent): void {
        // Получаем с помощью хелпера позицию мыши относительно холста
        let mousePos = getMousePos(this.foreground.body, event);

        // проходимся по всем массиву объектов с переднего планаю (1)
        for(let child of this.foreground.children) {
            // Если координаты мыши пересекают границы фигуры (2)
            if(
                mousePos.x >= child.position.x && mousePos.x <= child.position.x + child.size.width
                && mousePos.y >= child.position.y && mousePos.y <= child.position.y + child.size.height
            ) {
                // то вызываем срабатывание сразу 2 событий (если хотя бы один из них установлен)

                // Срабатывание движения мыши должно каждый раз вызывать callback данного события
                // Такое же поведение у дефолитного события mousemove на html узлахъ
                child.dispatchEvent('mousemove', {target: child});

                // А вот тут важно - срабатывание пересечения с фигурой должно вызываться только 1 раз!
                // До тех пор, пока мышь не покинет фигуру и наоборот.

                // то есть:
                // -> пересекли границы фигуры - получили вызов с mouseover, 
                // -> двигаем мышь внутри - тишина (если не было события mousemove)
                // -> покинули границы фигуры - получили вызов moveout
                if(child.mouseover === false) {
                    child.dispatchEvent('mouseover', {target: child});
                    child.mouseover = true;
                    child.mouseout = false;
                }
            } else {
                if(child.mouseout === false) {
                    child.dispatchEvent('mouseout', {target: child});
                    child.mouseout = true;
                    child.mouseover = false;
                }
            }
        }
    }
}