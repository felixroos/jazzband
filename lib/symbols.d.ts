export declare const chords: ({
    symbol: string;
    long: string;
    short: string;
    groups: string[];
} | {
    symbol: string;
    groups: string[];
    long: string;
    short?: undefined;
} | {
    symbol: string;
    groups: string[];
    short: string;
    long?: undefined;
} | {
    symbol: string;
    groups: string[];
    long?: undefined;
    short?: undefined;
})[];
export declare const scales: ({
    symbol: string;
    groups: string[];
    long?: undefined;
} | {
    symbol: string;
    groups: string[];
    long: string;
})[];
export declare const symbols: {
    chords: ({
        symbol: string;
        long: string;
        short: string;
        groups: string[];
    } | {
        symbol: string;
        groups: string[];
        long: string;
        short?: undefined;
    } | {
        symbol: string;
        groups: string[];
        short: string;
        long?: undefined;
    } | {
        symbol: string;
        groups: string[];
        long?: undefined;
        short?: undefined;
    })[];
    scales: ({
        symbol: string;
        groups: string[];
        long?: undefined;
    } | {
        symbol: string;
        groups: string[];
        long: string;
    })[];
};
export declare const levels: string[];
export declare function groupFilter(group: any): (item: any) => boolean;
export declare function scaleNames(group?: string): any;
export declare function chordNames(group?: string): any;
export declare function groupNames(): string[];
export declare function symbolName(type: any, symbol: any, long: any): any;
export declare function scaleName(symbol: any, long?: boolean): any;
export declare function chordName(symbol: any, long?: boolean): any;
export declare function randomItem(array: any): any;
export declare function randomScale(group: any): any;
export declare function randomChord(group: any): any;
