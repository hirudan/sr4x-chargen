import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Character} from './components/Character';
import * as configs from './data/configs/config.json'

import 'bootstrap/dist/css/bootstrap.min.css';

console.log('React', React);
console.log('ReactDOM', ReactDOM);

ReactDOM.render(<Character name={"Aya"} bp={configs.startingBP}/>, document.getElementById("root"));
