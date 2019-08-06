import { SequenceEvent } from '../sheet/Sequence';
export declare class Pattern {
    static traverse(size: any, step: any, offset?: number): any[];
    static traverseArray(array: any, move: any, start?: number): any[];
    static getPositions(positions: any, array: any): any;
    static flat(array: any[]): any;
    static nestIndices(...patterns: any[]): any;
    static getNested(array: any, parent: any, child: any): any;
    static deepNest(array: any, tree: any): void;
    static traverseNested(array: any, pattern: any, move?: number, start?: number): any;
    static testFormat(nestedNotes: string[][]): string;
    static scale(scaleName: any, pattern?: number[], range?: any): any[];
    static render(scaleName: any, patterns: any, range?: string[]): any;
    static renderEvents(lines: any, options?: any): SequenceEvent[];
}
