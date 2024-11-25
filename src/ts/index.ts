import { drawGrid, getColor } from "./helpers";
import InteractiveCanvas from "./classes/core/InteractiveCanvas";
import RectangleShape from "./classes/core/Rectangle";
import Port from "./classes/core/Port";
import UI from "./classes/UI/UI";

// external lib for data visualization
import { json2html } from "../libs/json2html/json2html";

// init project canvas object
const rootSelector = "#app-root";
const width = 500;
const height = 500;
const canvas = new InteractiveCanvas(rootSelector, width, height);
const ui = new UI(rootSelector, 350, height);

 // creating base shapes
 const rect1 = new RectangleShape({
    size: {
        width: 100, height: 80,
    },

    position: {
        x: 50, y: 50,
    },

    style: {
        fillColor: getColor('darkRed'),
        borderColor: getColor('brightRed'),
        borderThickness: 2,
        margin: 20,
    },
});

const rect2 = new RectangleShape({
    size: {
        width: 100, height: 80,
    },

    position: {
        x: 350, y: 350,
    },

    style: {
        fillColor: getColor('darkBlue'),
        borderColor: getColor('brightBlue'),
        borderThickness: 2,
        margin: 20,
    },
});

// append new shapes to foreground
canvas.foreground.appendChild(rect1);
canvas.foreground.appendChild(rect2);

// testing main feature
rect1.ports.getPort('C').connectTo(rect2.ports.getPort('B'));

// rendering background and grid once for better performance
canvas.background.fill(getColor('carbon'));

drawGrid(canvas.background.context, {
    gridSize: 20,
    gridLineColor: 'rgba(255, 255, 255, 0.025)',
    gridLineThickness: 1,
});

// 
const drawFrame = () => {
    requestAnimationFrame(drawFrame);
    canvas.foreground.render();
};

const convertObjectToHTML = (objectToRender: object) => {
    //@ts-ignore
    return json2html({
        json: JSON.stringify(objectToRender),
        theme: 'dracula',
        showTypeOnHover: true,
    });
};

drawFrame();

// Обновляем соединение, когда был выбран новый метод поиска пути
ui.elements.connectionMethod.addEventListener('change', () => {
    if(canvas.foreground.children.length > 0) {
        // выбираем какую-нибудь фигуру c соединением
        let rectWithConnection = canvas.foreground.children.find(someRect => someRect.hasConnection() === true);

        // выбираем активный порт
        let someActivePort = rectWithConnection.ports.getAll().find(somePort => somePort.isBusy === true);

        // Обновляем соединение
        someActivePort.reconnect();
    }
});


canvas.foreground.children.forEach(shape => {
    shape.addEventListener('mouseover', event => {
        shape.updateOpacity(0.35);
        canvas.foreground.body.style.cursor = "pointer";

        ui.elements.mouseTarget.replaceChild(convertObjectToHTML({
            class: 'RectangleShape',
            id: event.target.id,
            x: event.target.position.x,
            y: event.target.position.y,
        }));
    });

    shape.addEventListener('mouseout', event => {
        shape.updateOpacity(1);
        canvas.foreground.body.style.cursor = "initial";

        ui.elements.mouseTarget.resetValue();
    });

    shape.addEventListener('drag', event => {
        shape.updateOpacity(0.1);
    

        // Обновляем позицию на основе события перетаскивания
        shape.moveTo(
            event.offset.x - shape.size.width / 2,
            event.offset.y - shape.size.height / 2,
            canvas.foreground.children
        );

        canvas.foreground.body.style.cursor = "grab";
    });

    shape.addEventListener('dragend', event => {
        shape.updateOpacity(0.35);
        canvas.foreground.body.style.cursor = "pointer";
    });

    shape.addEventListener('mouseup', event => {
        ui.elements.mouseTarget.replaceChild(convertObjectToHTML({
            class: 'RectangleShape',
            id: event.target.id,
            x: event.target.position.x,
            y: event.target.position.y,
        }));
    });

    // Добавляем обработчик событий мыши для каддого порта
    shape.ports.getAll().forEach(port => {
        // Обрабатываем событие "мышь оказалась над портом"
        port.addEventListener('mouseover', () => {
            // Показываем курсор "поинтер" и информацию о порте если: 
            // - у фигуры нет соединений
            // - или показываем если это активный порт с соединением
            if(!shape.hasConnection() || port.isBusy) {
                canvas.foreground.body.style.cursor = "pointer";
                port.style.visibility = true;
                port.style.fillColor = 'rgba(55, 55, 55, 1)'; // более светый цвет когда мышь прямо над портом

                // Выводим информацию о текущем порте в панель справа
                ui.elements.mouseTarget.replaceChild(convertObjectToHTML({
                    class: 'Port',
                    letter: port.letter,
                    x: port.connectionPoint.point.x,
                    y: port.connectionPoint.point.y,
                    parent: port.parent.id,
                    isBusy: port.isBusy,
                    endPoint: port.isBusy === true ? port.endPoint.parent.id : null,
                    role: port.isBusy === true ? port.role : null,
                }));
            } 
        });

        // Событие наведения мыши в сторону порта (там своя широкая зона где будет сработано событие)
        port.addEventListener('hoveron', () => {
            // Показать порт если у фигуры есть соединение и этот порт и есть активный порт.
            // Это в свою очередь "приглашает" пользователя провзаимодействовать с портом
            if(shape.hasConnection() && port.isBusy) port.style.visibility = true;
        });

        // Событие когдла мышь покидает окрестности порта
        port.addEventListener('hoveroff', () => {
            // Скрываем если так же фигура имеет соединение и порт в окрестностях которого была мышь - активен
            if(shape.hasConnection() && port.isBusy) port.style.visibility = false;
        });

        // Событие "мышь покинула непосредственно порт"
        port.addEventListener('mouseout', () => {
            // Показываем курсор "изначальный"
            // - у фигуры нет соединений
            // - или показываем если это активный порт с соединением
            if(!shape.hasConnection() || port.isBusy) {
                canvas.foreground.body.style.cursor = "initial";
                port.style.fillColor = 'rgba(25, 25, 25, 1)';   // при уходе мышки с порта цвет более тёмный
                ui.elements.mouseTarget.resetValue();           // скрываем информацию о порте в панели справа
            }
        });

        // Событие клика на порт
        port.addEventListener('click', () => {
            // В зависимости от текущего состояния порта, клик вызовет либо подключение к порту, либо отключение от него
            if (port.isBusy) {
                // При отключении метод возвращает объект порта, с котором было соединение
                // запоминаем ID фигуры, с которой было ранее соединение
                port.parent.lastConnectionWith = port.disconnect().parent.id;

                // Показываем все порты фигуры, от порта которого мы отключились (то есть в чьих окрестностях кликнули)
                // Таким образом мы как бы "приглашаем" переподключиться в соседние порты или обратно к этому же
                shape.ports.showAll();
            } else if (!shape.hasConnection() && !port.isBusy && port.parent.lastConnectionWith) {
                // При повторном клике или клике к порту без соединения 
                // находим порт, который ожидает соединения и остался в открытом виде
                let shapeWithOpenPort = canvas.foreground.children.find(otherShape => otherShape.id === port.parent.lastConnectionWith);
                let openPort = shapeWithOpenPort.ports.getAll().find(otherPort => otherPort.isBusy === true);

                // переподключаемся к нему
                port.connectTo(openPort);

                // Скрываем все порты текущей фигуры
                shape.ports.hideAll();
            }
        });
    });

});

canvas.processIntersectionsWithMouse();

console.log(canvas, ui, rect1);