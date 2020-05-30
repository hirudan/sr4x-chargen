import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Character} from './components/Character';

console.log('React', React);
console.log('ReactDOM', ReactDOM);

ReactDOM.render(<Character name={"Aya"} bp={200}/>, document.getElementById("root"));
