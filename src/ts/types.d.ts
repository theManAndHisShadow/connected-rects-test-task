type Style = {
    fillColor: string;
    borderColor: string;
    borderThickness: number;
}

type Point = {
    x: number;
    y: number;
};

type Size = {
    width: number;
    height: number;
};

type GeometricPrimitive = {
    position: Point;
    size: Size;
    style: Style;
}

type Rectangle = GeometricPrimitive;

type ConnectionPoint = {
    point: Point;
    angle: number;
};