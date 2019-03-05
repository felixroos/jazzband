export declare class Logger {
    static emoji: {
        bestMatch: {
            icon: string;
            description: string;
        };
        force: {
            icon: string;
            description: string;
        };
        lucky: {
            icon: string;
            description: string;
        };
        wrong: {
            icon: string;
            description: string;
        };
        similar: {
            icon: string;
            description: string;
        };
        parallel: {
            icon: string;
            description: string;
        };
        contrary: {
            icon: string;
            description: string;
        };
        noOblique: {
            icon: string;
            description: string;
        };
        noChange: {
            icon: string;
            description: string;
        };
        topAdded: {
            icon: string;
            description: string;
        };
        topRemoved: {
            icon: string;
            description: string;
        };
        bottomRemoved: {
            icon: string;
            description: string;
        };
        bottomAdded: {
            icon: string;
            description: string;
        };
        movedUp: {
            icon: string;
            description: string;
        };
        movedDown: {
            icon: string;
            description: string;
        };
        equilibrium: {
            icon: string;
            description: string;
        };
        fewChoices: {
            icon: string;
            description: string;
        };
        error: {
            icon: string;
            description: string;
        };
        rootless: {
            icon: string;
            description: string;
        };
    };
    static logCustom(args: any, logFn?: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    }): void;
    static logLegend(): void;
    static logSheet(sheet: any): void;
    static logLabel(key: any): any;
    static logChoice(choice: any): void;
    static logNotes(options: any): string[];
    static logVoicing({ chord, previousVoicing, logIdle, combinations, bestPick, pick, range, choice, direction, choices }: any): any;
}
