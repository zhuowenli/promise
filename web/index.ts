import './assets/css/style.scss';

const title = document.createElement('h1');
title.textContent = 'Hello Poi!';
title.className = 'title';

const tip = document.createElement('div');
tip.textContent = 'Edit web/index.ts and save to reload.';
tip.className = 'tip';

const app = document.getElementById('app');

if (app) {
    app.appendChild(title);
    app.appendChild(tip);
}

console.log(app);
