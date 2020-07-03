import {Attribute} from "../components/Enums";

export interface Skill {
    id: number,
    name: string,
    linkedAttr: Array<Attribute>,
    reqAwakened: boolean,
    group: number
}