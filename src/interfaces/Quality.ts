export interface Quality{
    id: number,                  // globally unique id of the quality
    name: string,                // human-readable name
    cost: number,                // cost in BP
    selectable: boolean,         // false only for metagenetic qualities
    positive: boolean,           // positive quality?
    effect: string               // description of what the quality does
    requirements?: Array<number> // list of IDs of prerequisite qualities. Positive numbers indicate
                                 // a required quality, negative numbers a restricted quality
    options?: Array<string>      // to handle things like "Awakened" with sub-qualities
}