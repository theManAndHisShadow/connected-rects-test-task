import Port from "./Port";

export default class PortsMap {
    A: Port;
    B: Port;
    C: Port;
    D: Port;

    constructor({A, B, C, D}: {A: Port, B: Port, C: Port, D: Port}){
        this.A = A;
        this.B = B;
        this.C = C;
        this.D = D;
    }

    moveAll(dx: number, dy: number){
        const targets = [this.A, this.B, this.C, this.D];

        targets.forEach(port => {
            port.connectionPoint.point.x += dx;
            port.connectionPoint.point.y += dy;

           if(port.isBusy) {
                port.reconnect();
           }
        });
    }

    getAll(): Port[] {
        return [this.A, this.B, this.C, this.D];
    }
}