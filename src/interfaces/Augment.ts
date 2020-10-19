import {Attribute, AugGrade, AugType} from "../components/Enums";

export interface Augment{
    guid? : string,
    id: number,
    name: string,
    desc?: string,
    type: AugType,
    grade?: AugGrade,
    rating?: number,
    cap?: number,
    maxRating?: number,
    costEss: number,
    costNuyen: number,
    costCap?: number,
    relAttrs?: Attribute[],
    relSkills?: Number[],
    relTests?: Number[]
}
