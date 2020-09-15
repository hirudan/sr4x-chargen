import React from 'react';
import {Skill} from '../interfaces/Skill';
import {SkillGroup} from '../interfaces/SkillGroup';
import skillData from '../data/character/skills.json';
import {Button, Form} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import * as strings from "../data/strings/en-us.json";
import * as configs from "../data/configs/config.json";
import {ArrowBox} from "./ArrowBox";
import {SkillGroupCard} from "./SkillGroupCard";

export interface SkillProps{
    skills: Array<SkillGroup>,
    qualities: Array<number>,
    onAdd: any,
    onRemove: any,
    onIncrement: any,
    onDecrement: any
}

interface SkillState{
    showModal: boolean,
    selectedSkillGroups: boolean[],
    selectedSkills: boolean[]
}

const AWAKENED_ID: number = 12;
const skillGroupMap = buildSkillGroups();
const NUM_SKILL_GROUPS: number = Object.keys(skillGroupMap).length;
const NUM_SKILLS: number = skillData.skills.length;

export class SkillBox extends React.Component<SkillProps, SkillState>{
    
    constructor(props: SkillProps){
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.onSelectSkill = this.onSelectSkill.bind(this);
        this.onSelectSkillGroup = this.onSelectSkillGroup.bind(this)
        this.submitForm = this.submitForm.bind(this);
        const selectedSkillGroups: boolean[] = new Array(NUM_SKILL_GROUPS)
        const selectedSkills: boolean[] = new Array(NUM_SKILLS);
        selectedSkillGroups.fill(false);
        selectedSkills.fill(false);
        this.setState(this.state ={
            showModal: false,
            selectedSkillGroups: selectedSkillGroups,
            selectedSkills: selectedSkills
        });
    }

    handleClose() {
        this.setState({ showModal: false });
    }

    handleShow() {
        
        this.setState({ showModal: true, 
            selectedSkillGroups: this.state.selectedSkillGroups.fill(false) , 
            selectedSkills: this.state.selectedSkills.fill(false)});
    }
    
    onSelectSkill(id: number){
        let newSelectedSkills = this.state.selectedSkills;
        newSelectedSkills[id] = !newSelectedSkills[id];
        this.setState({selectedSkills: newSelectedSkills});
    }
    
    onSelectSkillGroup(id: number){
        let newSelectedSkillGroups = this.state.selectedSkillGroups;
        let newSelectedSkills = this.state.selectedSkills;
        newSelectedSkillGroups[id] = !newSelectedSkillGroups[id];
        skillGroupMap[id].map(skill => newSelectedSkills[skill.id] = newSelectedSkillGroups[id]);
        this.setState({selectedSkillGroups: newSelectedSkillGroups, selectedSkills: newSelectedSkills});
    }

    submitForm(){
        let toAdd = [];
        this.state.selectedSkillGroups.map((item, index) => {
            if(item){
                toAdd.push([index, true]);
            }
        });
        this.state.selectedSkills.map((item, index) => {
            if(item){
                toAdd.push([index, false]);
            }
        });

        this.props.onAdd(toAdd);
        this.handleClose();
    }
    
    render(){
        return(
            <div>
                Active Skills:
                {buildSkillList(this.props.skills, this.props.onIncrement, this.props.onDecrement, this.props.onRemove)}
                <Button onClick={this.handleShow}>++</Button>
                <Modal show={this.state.showModal} onHide={this.handleClose}
                       size="lg"
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {strings.general.skill_title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {strings.general.skill_greeting}
                        </p>
                        <p>
                            {strings.general.skill_rules.format(configs.qualMax.toString())}
                        </p>
                        <div>
                            <Form onSubmit={this.handleClose}>
                                <Form.Group controlId="skillSelect">
                                    {Object.keys(skillGroupMap).map((group, index) => {
                                        let toCard: Array<[number, boolean]> = [];
                                        toCard.push([Number(group), this.state.selectedSkillGroups[group]]);
                                        skillGroupMap[group].forEach((skill: Skill) => toCard.push([skill.id, this.state.selectedSkills[skill.id]]))
                                        return(
                                            <SkillGroupCard key={index} skillGroup={toCard} onSelectSkillGroup={this.onSelectSkillGroup} onSelectSkill={this.onSelectSkill} />
                                        )
                                    })}
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
                        <Button type="submit" onClick={this.submitForm}>Add</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

// Renders the list of skills for the character
function buildSkillList(skills: Array<SkillGroup>, onIncrement, onDecrement, onRemove): any{
    return(
        <div>
            {Object.keys(skills).map(function(skillGroup){
                return(
                    shouldDisplaySkillGroup(Number(skillGroup), skills) && <ul key={strings.skillGroups[Number(skillGroup)]}>
                        {strings.skillGroups[Number(skillGroup)]}
                        {skills[Number(skillGroup)].rating > 0 && <span>
                        <ArrowBox name={skillGroup} value={skills[Number(skillGroup)].rating} 
                                  onIncrement={() => onIncrement(Number(skillGroup), true)} 
                                  onDecrement={() => onDecrement(Number(skillGroup), true)} />
                                  <button onClick={() => onRemove(Number(skillGroup), true)}>--</button></span>}
                        {Object.keys(skills[skillGroup].skills).map(function(skill){
                            let info = getSkillById(Number(skill));
                            return (skills[skillGroup].skills[Number(skill)] > 0 && <li key={skill}>{strings.skills[info.id]}
                                {<ArrowBox key={strings.skills[info.id]} name={strings.skills[info.id]} value={skills[Number(skillGroup)].skills[Number(skill)]} 
                                           onIncrement={() => onIncrement(info.id, false)} onDecrement={() => onDecrement(info.id, false)} />}
                                {skills[skillGroup].rating === 0 && <button onClick={() => onRemove(info.id, false)}>--</button>}</li>)
                        })}
                    </ul>
                );
            })}
        </div>
    );
}

function canDisplaySkill(skill: number, qualities: Array<number>): boolean{
    let data = getSkillById(skill);
    return data.reqAwakened ? qualities.indexOf(AWAKENED_ID) !== -1 : true;
}

function canDisplaySkillGroup(group: number, qualities: Array<number>, skills: Array<SkillGroup>): boolean{
    let alreadyHas: boolean = skills[group].rating > 0;
    let requiresAwakened: boolean = skillData.skills.filter(s => s.group === group).some(s => s.reqAwakened) && qualities.indexOf(AWAKENED_ID) !== -1;
    return alreadyHas && requiresAwakened;
}

function getSkillById(id: number){
    return skillData.skills.find(skill => skill.id === id);
}

function buildSkillGroups(): Object{
    let groupedSkills = { };
    // As a convention, assign non-grouped skills to "group -1"
    Object.keys(strings.skillGroups).map(group => groupedSkills[group] = skillData.skills.filter(skill => skill.group === Number(group)));
    return groupedSkills;
}

function shouldDisplaySkillGroup(group: number, skills: Array<SkillGroup>): boolean {
    return skills[group].rating > 0 || !Object.values(skills[group].skills).every(skill => skill <= 0);
}
