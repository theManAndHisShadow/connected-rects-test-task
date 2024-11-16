import { getMousePos, isPointInsideCircle } from "../helpers";
import RectangleShape from "./Rectangle";

/**
 * Локально определнный вспомогательный класс слоя холста.
 * Нигде более не задействуется, поэтому без директивы экспорт.
 */
class Layer {
    parent: InteractiveCanvas;
    body: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    children: RectangleShape[];

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
    isMousePressed: boolean;

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
    processIntersectionsWithMouse(): void {
        this.addEventListener('mousedown', event => {
            this.isMousePressed = true;

            if(event instanceof MouseEvent) {
                let mousePos = getMousePos(this.foreground.body, event);


                for(let child of this.foreground.children) {
                    let ports = Object.values(child.ports);
                    
                    // события портов
                    for(let port of ports) {
                        let center =  port.connectionPoint.point;
                        if(isPointInsideCircle(mousePos.x, mousePos.y, center.x, center.y, port.r)) {
                            port.dispatchEvent('click', {target: port});
                        }
                    }
                }
            }
        });

        this.addEventListener('mouseup', event => {
            this.isMousePressed = false;
        });

        this.addEventListener('mousemove', event => {
            if (event instanceof MouseEvent) {
                // Получаем с помощью хелпера позицию мыши относительно холста
                let mousePos = getMousePos(this.foreground.body, event);
                let mouseDragStartPos = {x: 0, y: 0};

                // проходимся по всем массиву объектов с переднего планаю (1)
                for (let child of this.foreground.children) {
                    const isIntersecting = mousePos.x >= child.position.x && mousePos.x <= child.position.x + child.size.width
                                         && mousePos.y >= child.position.y && mousePos.y <= child.position.y + child.size.height;
                    
                    if(isIntersecting) {
                        let eventData = {
                            target: child,
                            mousePosition: mousePos,
                        }

                        // (1) - Регистрируем событие движения внутри контура фигуры
                        child.dispatchEvent('mousemove', eventData);
                        child.eventStates.mousemove = true;

                        // (2) - Если фигура ещё не была пересечена мышью ранее, срабатывает событие mouseover
                        if (!child.eventStates.mouseover) {
                            child.dispatchEvent('mouseover', eventData);
                            child.eventStates.mouseover = true;
                            child.eventStates.mouseout = false;
                        }

                        // (3a) - Обработка перетаскивания (начало)
                        if (this.isMousePressed) {
                            child.dispatchEvent('drag', {
                                eventData,
                                offset: {
                                    x: mousePos.x - mouseDragStartPos.x,
                                    y: mousePos.y - mouseDragStartPos.y
                                }
                            });

                            mouseDragStartPos = mousePos; // важно, для перетаскивания нужно каждый раз перезаписывать данное свойство
                            child.eventStates.drag = true;
                        }

                        // (3b) - Обработка перетаскивания (конец процесса)
                        // Если мышь отпущена, завершение перетаскивания
                        if (!this.isMousePressed && child.eventStates.drag) {
                            child.dispatchEvent('dragend', eventData);
                            child.eventStates.drag = false;
                        }

                    } else {
                        // Если мышь покинула фигуру, срабатывает событие mouseout
                        // Сброс других свойств
                        if (!child.eventStates.mouseout) {
                            child.dispatchEvent('mouseout', { target: child });
                            child.eventStates.mouseout = true;
                            child.eventStates.mouseover = false;
                        }

                        // Обновляем состояние для движения мыши за пределами фигуры
                        child.eventStates.mousemove = false;
                    }
                }

                // отдельно события портов
                for(let child of this.foreground.children) {
                    let ports = Object.values(child.ports);
                    
                    for(let port of ports) {
                        let center =  port.connectionPoint.point;

                        // взаимодействие с портом косвенно (движение в его ховер области)
                        if(isPointInsideCircle(mousePos.x, mousePos.y, center.x, center.y, port.hoverR)) {
                            if (!port.eventStates.hoveron) {
                                port.dispatchEvent('hoveron', {target: port});
                                port.eventStates.hoveron = true;
                                port.eventStates.hoveroff = false;
                            }

                        } else {
                            if(!port.eventStates.hoveroff) {
                                port.dispatchEvent('hoveroff', {target: port});
                                port.eventStates.hoveroff = true;
                                port.eventStates.hoveron = false;
                            }
                        }

                        // взаимодействие непосредственно с портом
                        if(isPointInsideCircle(mousePos.x, mousePos.y, center.x, center.y, port.r * 2)) {
                            if (!port.eventStates.mouseover) {
                                port.dispatchEvent('mouseover', {target: port});
                                port.eventStates.mouseover = true;
                                port.eventStates.mouseout = false;
                            }

                        } else {
                            if(!port.eventStates.mouseout) {
                                port.dispatchEvent('mouseout', {target: port});
                                port.eventStates.mouseout = true;
                                port.eventStates.mouseover = false;
                            }
                        }
                    }
                }
            }
        });

    }
}