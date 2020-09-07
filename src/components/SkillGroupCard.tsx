import React from 'react';
import {ButtonGroup, Card, ToggleButton} from "react-bootstrap";
import * as strings from '../data/strings/en-us.json';

export interface SkillGroupProps{
    skillGroup: Array<[number, boolean]>,
    onSelectSkillGroup: any,
    onSelectSkill: any
}

export class SkillGroupCard extends React.Component<SkillGroupProps, any>{
    
    constructor(props: SkillGroupProps){
        super(props);
        this.onSelectSkill = this.onSelectSkill.bind(this);
        this.onSelectSkillGroup = this.onSelectSkillGroup.bind(this)
    }
    
    onSelectSkill(skill: number){
        this.props.onSelectSkill(skill);
    }
    
    onSelectSkillGroup(group: number){
        this.props.onSelectSkillGroup(group);
    }
    
    render(){
        return(
            <div>
                <Card style={{ width: '18rem' }}>
                    <Card.Body>
                        <ButtonGroup vertical>
                            {this.props.skillGroup.map((skill, index) => {
                                if(index === 0){
                                    return(
                                        <Card.Header>
                                            <ToggleButton key={skill[0]} type="checkbox" checked={skill[1]} value={skill[0]}
                                                          onChange={() => this.props.onSelectSkillGroup(skill[0])}>
                                                {strings.skillGroups[skill[0]]}
                                            </ToggleButton>
                                        </Card.Header>
                                    )
                                }
                                else{
                                    return(
                                        <ToggleButton key={skill[0]} type="checkbox" checked={skill[1]} value={skill[0]}
                                                      onChange={() => this.props.onSelectSkill(skill[0])}>
                                            {strings.skills[skill[0]]}
                                        </ToggleButton>
                                    )
                                }
                            })}
                        </ButtonGroup>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}