import * as React from 'react';
import {Quality} from '../interfaces/Quality';
import raceData from '../data/character/raceData.json';
import qualData from '../data/character/qualities.json';
import Modal from 'react-bootstrap/Modal';
import * as strings from '../data/strings/en-us.json';
import * as configs from '../data/configs/config.json'
import {Button, Form} from "react-bootstrap";
import {ChangeEvent} from "react";

export interface QualProps{
    onAdd: any,
    onRemove: any,
    qualities: Array<number>
    metatype: string
}

interface QualState{
    showModal: boolean,
    posSelected: boolean,
    selectedQual: string
}

export class QualBox extends React.Component<QualProps, QualState>{
    
    constructor(props: QualProps){
        super(props);
        this.onQualityChange = this.onQualityChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.togglePositive = this.togglePositive.bind(this);
        this.toggleNegative = this.toggleNegative.bind(this);
        this.state = {
            showModal: false,
            posSelected: true,
            selectedQual: ""
        }
    }

    handleClose() {
        this.setState({ showModal: false });
    }

    handleShow() {
        this.setState({ showModal: true });
    }
    
    togglePositive(){
        this.setState({posSelected: true});
    }

    toggleNegative(){
        this.setState({posSelected: false});
    }
    
    onQualityChange(e: ChangeEvent<HTMLSelectElement>){
        this.setState({selectedQual: e.currentTarget.value})
    }
    
    submitForm(index: number){
        this.props.onAdd(index);
        this.handleClose();
    }
    
    onRemove(index: number){
        this.props.onRemove(index);
    }
    
    render(){
        return(
            <div>
                Qualities:
                {buildQualityList(this.props.qualities, this.onRemove, this.props.metatype)}
                <Button onClick={this.handleShow}>++</Button>
                <Modal show={this.state.showModal} onHide={this.handleClose}
                       size="lg"
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {strings.general.quality_title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {strings.general.quality_greeting}
                        </p>
                        <p>
                            {strings.general.quality_rules.format(configs.qualMax.toString())}
                        </p>
                        <div>
                            <Form onSubmit={this.handleClose}>
                                <div key={`default-radio`} className="mb-3">
                                    <Form.Group controlId="positiveToggle">
                                        <Form.Check
                                            type='radio'
                                            id={`positive`}
                                            label={`Positive`}
                                            inline={true}
                                            checked={this.state.posSelected}
                                            onChange={this.togglePositive}
                                        />
                                        <Form.Check
                                            type='radio'
                                            id={`negative`}
                                            label={`Negative`}
                                            inline={true}
                                            checked={!this.state.posSelected}
                                            onChange={this.toggleNegative}
                                        />
                                    </Form.Group>
                                </div>
                                <Form.Group controlId="qualSelect">
                                    <Form.Control as="select" onChange={this.onQualityChange}>
                                        <option key={"default"}>...</option>
                                        {qualData.qualities.map((quality: Quality) => {return(
                                            (quality.selectable && quality.positive === this.state.posSelected &&
                                                this.props.qualities.indexOf(quality.id) === -1) &&
                                            (quality.requirements.length > 0 ? 
                                                canDisplayQuality(quality.id, this.props.qualities) : true) &&
                                            <option key={quality.id}>{strings.qualities[quality.id]["name"]}</option>
                                        )})}
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
                        <Button type="submit" onClick={() => this.submitForm(qualData.qualities.find(quality => quality.name === this.state.selectedQual).id)}>Add</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
    
}

function getQuality(id: number): Quality{
    return strings.qualities[id];
}

function canDisplayQuality(id: number, qualities: Array<number>){
    console.log(qualities);
    let requirements: Array<number> = qualData.qualities.find(q => q.id === id).requirements;
    let posSatisfied: boolean = requirements.filter(r => r>=0).length > 0 ? 
        requirements.filter(r => r>=0).some(r => qualities.indexOf(r) !== -1) : true;
    let negSatisfied: boolean = requirements.filter(r => r<0).length > 0 ? 
        requirements.filter(r => r<0).every(r => qualities.indexOf(Math.abs(r)) === -1) : true;
    
    return posSatisfied && negSatisfied;
}

// Renders an individual quality item
function buildQualityList(qualities: Array<number>, onRemove, metatype): any{
    return(
        <div>
            <ul>
                {qualities.map(function(quality){
                    let info = getQuality(quality);
                    return (<li key={quality}>{info["name"]}:&nbsp;{info["desc"]}&nbsp;{
                        raceData.metatypes.find(m => m.name === metatype)["qualities"].indexOf(quality) === -1 &&
                    <button onClick={() => onRemove(quality)}>--</button>}</li>)
                })}
            </ul>
        </div>
    );
}
