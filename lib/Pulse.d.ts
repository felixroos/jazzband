export declare class Pulse {
    defaults: {
        bpm: number;
        cycle: number;
        delay: number;
    };
    props: any;
    context: any;
    clock: any;
    events: any[];
    callbackAtTime: boolean;
    constructor(props?: {});
    getMeasureLength(bpm?: any, beatsPerMeasure?: any): number;
    arrayPulse(children: any, length: number, path: any[], start: number, callback: any, deadline?: any): any;
    tickArray(array: any, callback: any, deadline?: any, length?: any): Promise<{}>;
    start(): void;
    stop(): void;
    changeTempo(newTempo: any, timeout?: number): void;
}
