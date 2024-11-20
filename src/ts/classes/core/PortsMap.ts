import ConnectionPort from "./ConnectingPort";

export default class PortsMap {
    A: ConnectionPort;
    B: ConnectionPort;
    C: ConnectionPort;
    D: ConnectionPort;

    constructor({A, B, C, D}: {A: ConnectionPort, B: ConnectionPort, C: ConnectionPort, D: ConnectionPort}){
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

    getAll(): ConnectionPort[] {
        return [this.A, this.B, this.C, this.D];
    }
}