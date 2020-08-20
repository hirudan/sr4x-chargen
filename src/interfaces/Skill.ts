import {Attribute} from "../components/Enums";

export interface Skill {
    id: number,
    name: string,
    linkedAttr: Array<string>,
    reqAwakened: boolean,
    group: number
}