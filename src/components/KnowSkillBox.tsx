import * as React from 'react';
import configs from '../data/configs/config.json';
import {ChangeEvent} from 'react';
import * as strings from '../data/strings/en-us.json';
import {KnowledgeSkill} from "../interfaces/KnowledgeSkill";
import {Button, Form} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import {KnowSkillCategory} from "./Enums";
import {ArrowBox} from "./ArrowBox";

export interface KnowSkillProps{
    freePoints: number,
    onAdd: any,
    onRemove: any,
    onIncrement: any,
    onDecrement: any,
    knowSkills: Array<KnowledgeSkill>
}

interface KnowSkillState{
    showModal: boolean,
    academic: boolean,
    skillName: string
}

export class KnowSkillBox extends React.Component<KnowSkillProps, KnowSkillState>{
    
    constructor(props: KnowSkillProps){
        super(props);

        this.submitForm = this.submitForm.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.toggleAcademic = this.toggleAcademic.bind(this);
        this.toggleStreet = this.toggleStreet.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        
        this.state = {
            showModal: false,
            academic: true,
            skillName: ""
        }
    }

    handleClose() {
        this.setState({ showModal: false, skillName: "" });
    }

    handleShow() {
        this.setState({ showModal: true });
    }

    toggleAcademic(){
        this.setState({academic: true});
    }

    toggleStreet(){
        this.setState({academic: false});
    }

    onNameChange(e: ChangeEvent<HTMLTextAreaElement>){
        this.setState({skillName: e.currentTarget.value})
    }

    submitForm(){
        this.props.onAdd(this.state.skillName, this.state.academic ? KnowSkillCategory.LOG : KnowSkillCategory.INT);
        this.handleClose();
    }
    
    render(){
        return(
            <div>
                <Modal show={this.state.showModal} onHide={this.handleClose}
                       size="lg"
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {strings.general.knowskill_title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {strings.general.knowskill_greeting}
                        </p>
                        <p>
                            {strings.general.knowskill_rules.format(String(configs.numSkillsMax), 
                                String(configs.knowskillMaxChargen), String(configs.numSkillsNearMax), 
                                String(configs.knowskillMaxChargen - 1))}
                        </p>
                        <div>
                            <Form onSubmit={() => this.handleClose}>
                                <div key={`default-radio`} className="mb-3">
                                    <Form.Group controlId="academicToggle">
                                        <Form.Check
                                            type='radio'
                                            id={`academic`}
                                            label={`Academic/Professional`}
                                            inline={true}
                                            checked={this.state.academic}
                                            onChange={this.toggleAcademic}
                                        />
                                        <Form.Check
                                            type='radio'
                                            id={`street`}
                                            label={`Interests/Street`}
                                            inline={true}
                                            checked={!this.state.academic}
                                            onChange={this.toggleStreet}
                                        />
                                    </Form.Group>
                                </div>
                                <Form.Group controlId="qualSelect">
                                    <Form.Control type="text" onChange={this.onNameChange} placeholder={"Enter skill name"} />
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
                        <Button type="submit" onClick={this.submitForm}>Add</Button>
                    </Modal.Footer>
                </Modal>
                
                {strings.general.free_know_skills}: {this.props.freePoints}
                <hr />
                {strings.general.acpro_know_skills}
                {buildKnowSkillList(this.props.knowSkills, KnowSkillCategory.LOG, this.props.onIncrement, this.props.onDecrement, this.props.onRemove)}
                <hr />
                {strings.general.intstr_know_skills}
                {buildKnowSkillList(this.props.knowSkills, KnowSkillCategory.INT, this.props.onIncrement, this.props.onDecrement, this.props.onRemove)}
                <hr />
                <p><Button onClick={this.handleShow}>{strings.general.add_knowskill}</Button></p>
            </div>
        );
    }
}

function buildKnowSkillList(knowSkills: KnowledgeSkill[], category: KnowSkillCategory, onIncrement, onDecrement, onRemove){
    return(
        <div>
            <ul key={"noot noot"}>
            {knowSkills.filter(skill => skill.category == category).map(skill => {
                return(
                    <li key={skill.name}>
                        {skill.name}
                        <ArrowBox name={skill.name} value={skill.rating}
                                  onIncrement={() => onIncrement(skill.name, category)}
                                  onDecrement={() => onDecrement(skill.name, category)} />
                        <Button name={"remove-"+skill.name} onClick={() => onRemove(skill.name, category)}>--</Button>
                    </li>
                );
            })}
            </ul>
        </div>
    )
}