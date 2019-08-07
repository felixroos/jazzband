import { RenderedMeasure, MeasureOrString } from './Measure';
export declare class Snippet {
    static controlSigns: ({
        name: string;
        short: string;
        end: boolean;
    } | {
        name: string;
        short: string;
        end?: undefined;
    })[];
    static render(snippet: any, options?: any): RenderedMeasure[];
    static wrapPipes(string: any): string;
    static formatForDiff(snippet: any): string;
    static format(snippet: any, linebreaks?: boolean): string;
    static parseBars(snippet: any): {
        compact: string;
        cells: string[];
        houses: any[];
        chars: any[];
    };
    static columnChars(snippet: any): void;
    static getCellBounds(index: any, snippet: any): any[];
    static minify(snippet: any, urlsafe?: boolean): string;
    static getControlSigns(symbols?: any[]): ({
        name: string;
        short: string;
        end: boolean;
    } | {
        name: string;
        short: string;
        end?: undefined;
    })[];
    static parse(snippet: any, simplify?: boolean): any[];
    static nest(string: any): any;
    static parse2(snippet: any, simplify?: boolean): any[];
    static testFormat(measures: RenderedMeasure[]): string;
    static from(measures: MeasureOrString[], format?: boolean): string;
    static expand(snippet: any, options?: any): string;
    static obfuscate(snippet: any, keepFirst?: boolean, format?: boolean): string;
}
