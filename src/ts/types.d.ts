type Style = {
    fillColor: string;
    maring?: number | null;
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
    id?: number | null;
    position: Point;
    size: Size;
    style: Style;
}

type Rectangle = GeometricPrimitive;

type ConnectionPoint = {
    point: Point;
    angle: number;
};

type ShapeEventStorage = {
    [key: string]: Array<(data: any) => void>;
}