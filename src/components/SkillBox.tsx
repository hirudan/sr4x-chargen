import React from 'react';
import {Skill} from '../interfaces/Skill';
import * as skills from '../data/character/skills.json';

export interface SkillProps{
    
}

interface SkillState{
    showModal: boolean
}

export class SkillBox extends React.Component<SkillProps, SkillState>{
    
    constructor(props: SkillProps){
        super(props);
        this.setState(this.state ={
            showModal: false
        });
    }
    
    render(){
        return(<p />);
    }
}
