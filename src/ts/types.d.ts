type Style = {
    fillColor: string;
    borderColor: string;
    borderThickness: number;
    margin?: number | null;
    visibility?: boolean | null;
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