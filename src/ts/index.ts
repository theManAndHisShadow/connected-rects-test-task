import { drawGrid, getColor } from "./helpers";
import InteractiveCanvas from "./classes/InteractiveCanvas";
import RectangleShape from "./classes/Rectangle";

// init project canvas object
const canvas = new InteractiveCanvas("#app-root", 500, 500);

 // creating base shapes
 const rect1 = new RectangleShape({
    size: {
        width: 100, height: 80,
    },

    position: {
        x: 100, y: 50,
    },

    style: {
        fillColor: getColor('darkRed'),
        borderColor: getColor('brightRed'),
        borderThickness: 2,
    },
});

const rect2 = new RectangleShape({
    size: {
        width: 100, height: 80,
    },

    position: {
        x: 330, y: 170,
    },

    style: {
        fillColor: getColor('darkBlue'),
        borderColor: getColor('brightBlue'),
        borderThickness: 2,
    },
});

// append new shapes to foreground
canvas.foreground.appendChild(rect1);
canvas.foreground.appendChild(rect2);

// testing main feature
rect1.ports.B.connectTo(rect2.ports.A);

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
}

drawFrame();

canvas.foreground.children.forEach(shape => {
    shape.addEventListener('mouseover', event => {
        shape.updateOpacity(0.35);
        canvas.foreground.body.style.cursor = "pointer";
    });

    shape.addEventListener('mouseout', event => {
        shape.updateOpacity(1);
        canvas.foreground.body.style.cursor = "initial";
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

});

canvas.processIntersectionsWithMouse();



console.log(canvas, rect1);