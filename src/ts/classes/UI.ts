export default class UI {
    width: number;
    height: number;

    constructor(cssSelector: string, width: number, height: number){
        const container = document.createElement('div');
              container.classList.add('app-ui__container');
              container.style.width = `${width}px`;
              container.style.height = `${height}px`;

        const containerInner = document.createElement('div');
              containerInner.classList.add('app-ui__container-inner');
              
        const trigger = document.createElement('input');
              trigger.type = 'checkbox';
              trigger.checked = true;
              trigger.setAttribute('checked', 'checked');

              trigger.addEventListener('change', () => {
                  localStorage.setItem('renderGrid', JSON.stringify(trigger.checked));
              });

        const label = document.createElement('label');
              label.innerText = 'Render grid: ';
              label.appendChild(trigger);

        const title = document.createElement('h3');
              title.innerText = '[Dev UI]';
              title.classList.add('app-ui__title');

        containerInner.appendChild(title);
        containerInner.appendChild(label);
        container.appendChild(containerInner);

        const appRoot = document.querySelector(cssSelector);
              appRoot.appendChild(container); 
    }
}