
import SynteticEventTarget from "../core/SynteticEventTarget";

interface UIElementType {
    type: string;
    classNames: string[];
    label: string;
    value: string | number | boolean;
    settingsKey: null | string;
}

export default class UIElement extends SynteticEventTarget{
    type: string;
    classNames: string[];
    label: string;
    value?: string | number | boolean | null;
    body: HTMLElement;
    settingsKey: null | string;

    constructor(params: UIElementType ){
          super();

          this.type = params.type;
          this.classNames = params.classNames;
          this.label = params.label;
          this.settingsKey = params.settingsKey;
          this.value = params.value && null;
          this.body = this.create();
    }

    private create(): HTMLElement {
          // создаём элемент, который будет содержать и лейбел текст элемента и значение элемента
          let labelElement = document.createElement('label');

          // если классы установлены - назначить их элементу
          if(this.classNames.length > 0) labelElement.classList.add(...this.classNames);

          // добавить базовый класс ui элемента
          labelElement.classList.add('app-ui__item');

          // установить текст лейбла
          labelElement.innerText = this.label + ': ';

          // переменная, которая хранит "тело" значения или null
          let valueContainer: HTMLSpanElement | HTMLInputElement | null = null;

          //если тип "текст"
          if(this.type == 'text') {
                // сохдаём обычный  span элемент
                valueContainer = document.createElement('span');
                valueContainer.innerHTML = this.value === null ? `<span style="color: rgba(255, 255, 255, 0.3)">null</span>` : `${this.value}`;
          } else if (this.type === 'checkbox') {
                      // если тип чекбокс - получить значение из localStorage
                      if (this.settingsKey && typeof this.settingsKey === 'string') {
                          // парсим значение из локал сторейдж
                          let valuesFromSettings: boolean | null = JSON.parse(localStorage.getItem(this.settingsKey) || 'null');
                  
                          // если оно нулл - прерываем поток ошибкой
                          if (valuesFromSettings === null) {
                              throw new Error(`Can't find '${this.settingsKey}' key in settings!`);
                          }
                  
                          // назначаем элементу значение из настроек, если в насройках есть соотвествующий ключ
                          this.value = valuesFromSettings;
                  
                          // создаём само тело "значения"
                          valueContainer = document.createElement('input');
                          valueContainer.setAttribute('type', 'checkbox');

                          // устанавливаем чекбокс в стостояние согласно состоянию в свойстве экземпляра
                          (valueContainer as HTMLInputElement).checked = this.value;
                  
                          // навешиываем обработчик события, чтобы вносить изменения в настройки по клику на чекбокс
                          valueContainer.addEventListener('change', event => {
                              this.value = (event.target as HTMLInputElement).checked;
                              localStorage.setItem(this.settingsKey, JSON.stringify(this.value));
                          });
                      }
                  }
                  

          if(valueContainer) {
                labelElement.appendChild(valueContainer);
          }

          return labelElement;
    }

    updateValue(newValue: string | boolean | number) {
          this.value = newValue;
          this.body.children[0].innerHTML = `${newValue}`;
    }

    resetValue(){
          this.value = null;
          this.body.children[0].innerHTML = `<span style="color: rgba(255, 255, 255, 0.3)">null</span>`;
    }
}