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

type GraphNodeType = {
    x: number;
    y: number;
    r: number;
    left: GraphNodeType | null;
    right: GraphNodeType | null;
    up: GraphNodeType | null;
    down: GraphNodeType | null;
    isMidlineNode: boolean;
};

type GraphNodesMap = { 
    [key: string]: GraphNodeType;
 };