
import SynteticEventTarget from "../core/SynteticEventTarget";

interface UIElementType {
    type: "text" | "checkbox" | "dropdown-list";
    classNames: string[];
    label: string;
    value: string | number | boolean;
    valuesList?: number[] | string [] | boolean[] | null;
    settingsKey: null | string;
}

export default class UIElement extends SynteticEventTarget{
    type: string;
    classNames: string[];
    label: string;
    value?: string | number | boolean | null;
    valuesList?: number[] | string [] | boolean[] | null;
    body: HTMLElement;
    settingsKey: null | string;

    constructor(params: UIElementType ){
          super();

          this.type = params.type;
          this.classNames = params.classNames;
          this.label = params.label;
          this.settingsKey = params.settingsKey;
          this.valuesList = params.valuesList ?? null;
          this.value = params.value ?? null;
          this.body = this.create();

          console.log(params);
    }

      private create(): HTMLElement {
            // создаём элемент, который будет содержать и лейбел текст элемента и значение элемента
            let labelElement = document.createElement('label');

            // если классы установлены - назначить их элементу
            if (this.classNames.length > 0) labelElement.classList.add(...this.classNames);

            // добавить базовый класс ui элемента
            labelElement.classList.add('app-ui__item');

            // установить текст лейбла
            labelElement.innerText = this.label + ': ';

            // переменная, которая хранит "тело" значения или null
            let valueContainer: HTMLSpanElement | HTMLInputElement | null = null;

            //если тип "текст"
            if (this.type == 'text') {
                  // сохдаём обычный  span элемент
                  valueContainer = document.createElement('span');
                  valueContainer.innerHTML = this.value === null ? `<span style="color: rgba(255, 255, 255, 0.3)">null</span>` : `${this.value}`;
            } else if (this.type === 'checkbox' || this.type === 'dropdown-list') {
                  // если тип чекбокс - получить значение из localStorage
                  if (this.settingsKey && typeof this.settingsKey === 'string') {
                        // парсим значение из локал сторейдж
                        let valuesFromSettings: boolean | null = JSON.parse(localStorage.getItem(this.settingsKey));

                        // если оно нулл, то создаём такой свойство чтобы не было ошибок
                        if (valuesFromSettings === null) {
                              localStorage.setItem(this.settingsKey, JSON.stringify(this.value));
                        }

                        // назначаем элементу значение из настроек, если в насройках есть соотвествующий ключ
                        if(valuesFromSettings !== null) this.value = valuesFromSettings;


                        if (this.type === 'checkbox') {
                              // создаём само тело "значения"
                              valueContainer = document.createElement('input');
                              valueContainer.setAttribute('type', 'checkbox');

                              console.log(this.value);

                              // устанавливаем чекбокс в стостояние согласно состоянию в свойстве экземпляра
                              (valueContainer as HTMLInputElement).checked = Boolean(this.value);
                        } else if (this.type === 'dropdown-list' && (this.valuesList !== null && Array.isArray(this.valuesList))) {
                              valueContainer = document.createElement('select');


                              for (let option of this.valuesList) {
                                    let optionContainer = document.createElement('option');
                                    optionContainer.innerText = `${option}`;

                                    // А если будут разного типа значенгия из списка значений и выбранного значения?
                                    // По хорошему надо бы более кардианльно разделить эти типы элементов в свои классы
                                    if (option === this.value) {
                                          optionContainer.setAttribute('selected', '');
                                    }

                                    valueContainer.appendChild(optionContainer);
                              }
                        }

                        // навешиываем обработчик события, чтобы вносить изменения в настройки по клику на чекбокс
                        if (valueContainer) {
                              valueContainer.addEventListener('change', event => {
                                    if (this.type == 'checkbox') this.value = (event.target as HTMLInputElement).checked;
                                    if (this.type == 'dropdown-list') this.value = (valueContainer as HTMLSelectElement).value;

                                    localStorage.setItem(this.settingsKey, JSON.stringify(this.value));
                              });
                        }
                  }
            }


            if (valueContainer) {
                  labelElement.appendChild(valueContainer);
            }

            return labelElement;
      }

    updateValue(newValue: string | boolean | number) {
          this.value = newValue;
          this.body.children[0].innerHTML = `${newValue}`;
    }

    replaceChild(newChild: HTMLElement){
      this.body.replaceChild(newChild, this.body.children[0]);
    }

    resetValue(){
          this.value = null;

          let defaultContainer = document.createElement('span');
          defaultContainer.innerHTML = `<span style="color: rgba(255, 255, 255, 0.3)">null</span>`;
          this.body.replaceChild(defaultContainer, this.body.children[0]);
    }
}