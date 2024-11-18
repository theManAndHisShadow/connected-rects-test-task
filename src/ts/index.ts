import { drawGrid, getColor } from "./helpers";
import InteractiveCanvas from "./classes/core/InteractiveCanvas";
import RectangleShape from "./classes/core/Rectangle";
import UI from "./classes/UI/UI";
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
rect1.ports.D.connectTo(rect2.ports.B);

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
        
        // Сохраняем текущее положение перед перемещением
        const previousPosition = { x: shape.position.x, y: shape.position.y };

        // Обновляем позицию на основе события перетаскивания
        shape.moveTo(
            event.offset.x - shape.size.width / 2,
            event.offset.y - shape.size.height / 2
        );

        // Проверяем пересечение после перемещения
        // NB: тут если использовать 3 фигуры, например, то при расположенные 3 фигур вплотную рядом, произойдёт блокирование средней фигуры
        // Поэтому систему проверки нужно делать с проверкой конкретного направления, напримеро через вспомогательные значения дельта x и дельта y
        if (shape.isIntersectsWith(canvas.foreground.children)) {
            // Если пересечение обнаружено, возвращаем фигуру на предыдущее место
            shape.moveTo(
                previousPosition.x,
                previousPosition.y
            );
        }

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

    Object.values(shape.ports).forEach(port => {
        port.addEventListener('mouseover', () => {
            canvas.foreground.body.style.cursor = "pointer";
            port.style.visibility = true;

            ui.elements.mouseTarget.replaceChild(convertObjectToHTML({
                class: 'ConnectingPort',
                letter: port.letter,
                x: port.connectionPoint.point.x,
                y: port.connectionPoint.point.y,
                parent: port.parent.id,
                isBusy: port.isBusy,
                endPoint: port.isBusy === true ? port.endPoint.parent.id : null,
            }));
        });

        port.addEventListener('hoveron', () => {
            port.style.visibility = true;
        });

        port.addEventListener('hoveroff', () => {
            port.style.visibility = false;
        });

        port.addEventListener('mouseout', () => {
            canvas.foreground.body.style.cursor = "initial";
            ui.elements.mouseTarget.resetValue();
        });

        port.addEventListener('click', () => {
            console.log('current selected port:', port);
        });
    });

});

canvas.processIntersectionsWithMouse();

console.log(canvas, ui, rect1);