import { utils } from './utils.js';

const indications = document.getElementById("indications");

let indicationsText = await fetch('./assets/indications.txt')
    .then(response => response.text());
let indicationsArray = indicationsText.split('\n');

indications.innerHTML = indicationsArray[Math.random() * indicationsArray.length | 0];