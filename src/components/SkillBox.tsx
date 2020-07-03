import React from 'react';
import {Skill} from '../interfaces/Skill';
import skillData from '../data/character/skills.json';
import {Attribute} from "./Enums";

export interface SkillProps{
    skills: Object,
    onAdd: any,
    onRemove: any,
    onIncrement: any,
    onDecrement: any
}

interface SkillState{
    showModal: boolean
}

export class SkillBox extends React.Component<SkillProps, SkillState>{
    
    constructor(props: SkillProps){
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.setState(this.state ={
            showModal: false
        });
    }

    handleClose() {
        this.setState({ showModal: false });
    }

    handleShow() {
        this.setState({ showModal: true });
    }
    
    render(){
        return(<p />);
    }
    
    buildSkillGroups(){
        let groupedSkills = { };
        // As a convention, assign non-grouped skills to "group -1"
        skillData.skills.map((skill: Skill) => {isNaN(skill.group) ? groupedSkills[-1].append(skill.id) : 
            groupedSkills[skill.group].append(skill.id)})
        
        return groupedSkills;
    }
}


