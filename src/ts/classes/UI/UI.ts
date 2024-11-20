import UIElement from "./UIElement";

interface UIElementsMap {
      [key: string]: UIElement;
}

export default class UI {
    width: number;
    height: number;
    root: HTMLElement;
    elements: UIElementsMap

      constructor(cssSelector: string, width: number, height: number) {
            const container = document.createElement('div');
                  container.classList.add('app-ui__container');
                  container.style.width = `${width}px`;
                  container.style.height = `${height}px`;

            const containerInner = document.createElement('div');
                  containerInner.classList.add('app-ui__container-inner');

            // корневой узел - куда добавлять весь блок с UI
            const appRoot = document.querySelector(cssSelector);
                  appRoot.appendChild(container);

            // не путать с глобальным корнем всего проекта,
            // в данном случае root - локальный корень (внешний элемент, содержащий весь блок панели)
            this.root = container;

            // создаём элементы панели
            const renderGrid = new UIElement({
                  type: 'checkbox',
                  label: 'Render grid',
                  classNames: [],
                  value: false,
                  settingsKey: 'renderGrid',
            });

            const useDashedLine = new UIElement({
                  type: 'checkbox',
                  label: 'Use dashed line',
                  classNames: [],
                  value: false,
                  settingsKey: 'useDashedLine',
            })

            const mouseTarget = new UIElement({
                  type: 'text',
                  label: 'Mouse target',
                  classNames: ['app-ui__mouse-target-display'],
                  value: null,
                  settingsKey: null,
            });

            // hotfix
            mouseTarget.body.style.width = '100%';

            // записываем их в экземляр класса
            this.elements = {
                  renderGrid,
                  useDashedLine,
                  mouseTarget,
            };

            const title = document.createElement('h3');
                  title.innerText = '[Dev UI]';
                  title.classList.add('app-ui__title');

            // добавляем в внутреннией контейнер панели
            containerInner.appendChild(title);
            containerInner.appendChild(this.elements.renderGrid.body);
            containerInner.appendChild(this.elements.useDashedLine.body);
            containerInner.appendChild(this.elements.mouseTarget.body);

            // добавляем внутренности в контейнер UI
            container.appendChild(containerInner);
      }
}