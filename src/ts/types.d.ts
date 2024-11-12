type Style = {
    centerColor: string;
    fillColor: string;
    borderColor: string;
    borderThickness: number;
}

type InteractiveCanvas = {
    background: CanvasRenderingContext2D;
    foreground: CanvasRenderingContext2D;
    width: number;
    height: number;
}

type Point = {
    x: number;
    y: number;
};

type Size = {
    width: number;
    height: number;
    style: Style;
};

type Rect = {
    position: Point;
    size: Size;
};

type ConnectionPoint = {
    point: Point;
    angle: number;
};