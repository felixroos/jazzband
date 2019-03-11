export declare class Snare {
    context: any;
    noise: any;
    noiseEnvelope: any;
    osc: any;
    oscEnvelope: any;
    constructor(context: any);
    noiseBuffer(): any;
    setup(): void;
    trigger(time: any): void;
}
