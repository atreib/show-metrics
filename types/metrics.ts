export interface Metrics {
    comment_lines: number;
    complexity: number;
    lines: number;
    statements: number;
}

export interface Measures {
    [commitId: string]: {
        before: Metrics;
        after: Metrics;
    }
}