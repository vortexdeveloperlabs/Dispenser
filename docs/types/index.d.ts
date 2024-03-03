declare module "FaultTolerance" {
    export interface Node {
        ip: string;
    }
    export interface Meta {
        /** This array is sorted based on the order the node should be tried. */
        nodes: Node[];
    }
}
