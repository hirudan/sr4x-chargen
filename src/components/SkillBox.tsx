import React from 'react';
import {Skill} from '../interfaces/Skill';
import skillData from '../data/character/skills.json';

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
        let rawSkills: Skill[] = skillData.skills;
        let groupedSkills = { };
        for(let s in skillData.skills){
            
        }
    }
}


