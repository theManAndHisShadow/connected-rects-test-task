# О проекте
  Была поставлена интересная задача, по соединению 2 прямоугольных фигур линией. <br>
Были заданы следующие правила соединения фигур:
- линия соединения должна быть построена по максимально короткому пути;
- линия может ломаться по пути своего следования, делая повороты;
- повороты линии могут быть только под 90 градусов;
- запрещены повороты на 180 градусов (движение в обратном направлении без огибания);
- требуется минимизировать количество поворотов;
- линии разрешено отступать от фигуры, дабы не создавать пересечения с ней;
- соединяющаяя линия должна соединяться с гранью прямоугольника;
- угол соединения в месте контакта с гранью должен быть строго перпендикулярен к этой грани.

# Визуальный смысл правил
  Если говорить простым языком, то данные правила формируют концецию "ортогональных соединений". Ортогональость здесь предполагает *перпендикулярность* в том смысле,
что когда функционал будет куда сложнее, линии должны огибать прямоугольные фигуры. Обойти фигуру можно и по другому пути. <br>

  Однако, если представить, что в пространстве множество прямоугольных фигур, самым оптимальным видом соединений как раз будут ортогональные соединения фигур, чем и объясняются вышеизложенные правила. Самая близкая аналогия - улицы Манхэттана: они состоят из сетки поперечных и продольных улиц, где невеозможно движение по диагонали, только по `перпендикулярным`, `прямым` и `зигзагообразым` маршрутам.
  
![32a9c86669f30fd9878545642a611488](https://github.com/user-attachments/assets/9c1fa2ce-e03b-426e-b114-396c48d77220)

# Возможности демо реализации
  Реализованы следующие функции:
- перетаскивание фигур через `drag'n'drop`;
- изменения места подсоединения через `клик` на вспомогательный узел;
- взаимодействие 2 фугур при столкновении;
- вывод отладочной информации справа: отрисовка вспомогательной сетки, изменение внешнего вида соединяющей линии, изменение метода подсоединения, информация об элементе при наведении.
  
![image](https://github.com/user-attachments/assets/55873d9f-0e43-4996-aab8-80d23d69906a)

# Основные классы и методы
Далее ниже будут представлены основные классы и методы, которые относятся непосредственно к алгоритму реализации ортогонального соедиения.

# Класс `ConnectionLine`
  В случае, если пара узлов (в реализации такие узлы называются *портами*) рядом с двумя прямоугольниками были связаны через клик, то вызывается `port1.connectTo(port2)`, уже внутри которого создаётся экземплр класса `ConnectionLine`.
| Свойство                    	| Тип данных 	| Описание                                                                                                                                                                	|
|-----------------------------	|------------	|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| `ConnectionLine.endPoints`  	| `Port[]`   	| Cсылки на два связанных порта прямоугольников                                                                                                                           	|
| `ConnectionLine.points`     	| `Point[]`  	| Результат метода `Graph.findPathBetween()`, а именно - готовые для отрисовки точки маршрута                                                                             	|
| `ConnectionLine.graph`      	| `Graph`    	| Ссылка на экземпляр класса `Graph`. С помощью данной ссылки, класс `ConnectionLine` получает доступ к методу `Graph.findPathBetween()                                   	|
| `ConnectionLine.method`     	| `string`   	| Значение для текущего метода отрисовки, допустимые значения `straight`, `shortest`, `orthogonal`. Данное значение берётся из `localStorage.getItem('connectionMethod`).  	|
| `ConnectionLine.color`      	| `string`   	| Цвет линии                                                                                                                                                              	|
| `ConnectionLine.renderAt()` 	| `Function` 	| Принимает 1 аргумент `context: CanvasRenderingContext2D`. В указанном контексте отрисовывает сегменты от "от точки до точки" из свойства `ConnectionLine.points`.       	|

# Класс `Graph`
Отвечает за отрисовку сетки графа. Граф состоит из связанных объектов `GraphNode` (узлов). Каждый узел связан с ближайшим соседом по направлениям `up`, `down`, `left`, `right`. Благодаря взаимным связям, возможно проложить путь от одного узла к другому. Так как граф состоит по сути из динамической, но структурно определённой сетки точек, то это позволяет находить пути между точками намного быстрее, чем если бы путь между точками пришлось бы искать иным образом.

| Свойство               	| Тип данных            	| Описание                                                                                                                                                                                                                         	|
|-----------------------	|-----------------------	|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| `Graph.parent`        	| `ConnectionLine`      	| Ссылка на родителький класс, в конструкторе которого требуется экземпляр                                                                                                                                                         	|
| `Graph.nodes`         	| `GraphNodesMap`       	| Хранит все сгенерированные узлы графа удобным образом. Специальный тип данных - пара значений `адрес узла`:`объект узла`. Ввиду того, что адрес узла "строка", позволяет быстро сравнивать узлы по адресу и находить нужный узел 	|
| `Graph.midline`       	| `object`              	| Хранит координаты центральной точки, на основе которой строятся вспомогательные срединные линии. Центральная точка - середина дистанции от центра одной фигуры до центра второй                                                  	|
| `Graph.lastPathDaata` 	| `QueueItem` \| `null` 	| Хранит данные из последнего успешно построенного пути                                                                                                                                                                            	|

# `Graph.generateSimpleGridPoints()`
Приватный метод. Не требует аргументов. Возвращает одномерный отсортированный по возрастанию массив из точек. Точки станут основой для узлов графа.

# `Graph.createGraphFrom()`
Приватный метод. На основе принимаемого массива создаёт двумерный массив (сетку), заполненный объектами `GraphNode`. В процессе генерации массива назначает ссылки соседей или `null` для каждого узла. <br> 

Правила назначения соседа: 
- соседом может быть только близлежащий узел;
- если узел, которому алгоритм назначает соседа, находится на краю графа, то со стороны края назначается `null`;
- если узел, которому алгоритм назначает соседа, находитяся рядом с фиругой, то с стороны фигуры назначается `null`.<br>

| Аргумент 	| Тип данных 	| Описание                                                                               	|
|----------	|------------	|----------------------------------------------------------------------------------------	|
| `points` 	| `Point[]`  	| Точки для создания графа. Важно чтобы массив был отстортирован как по `x` так и по `y` 	|

# `Graph.recalcPathCostByHeuristic()`
Приватный метод. Пересчитывает стоимость маршрута (пути) на основе типа эвристики и внутренних правил: <br>
- для эвристики `"shortest"` расчёт стоимости ведётся таким образом, чтобы маршрут формировался по самом короткому пути с наименьшим количестом поворотов. <br>
- для эвристики `"orthogonal"` расчёт стоимости ведётся таким образом, что все движения/повороты наказыватся большим штрафом, кроме движения с `startNode` на узел с свойством `isMidlineNode` равным `true`, движений по срединной линии и движения с срединной линии на `endNode`. Последние три типа движения напротив получают бонус и сниженную стоимость пути.

| Аргумент                     	| Тип данных                 	| Описание                                        	|
|------------------------------	|----------------------------	|-------------------------------------------------	|
| `heuristic`                  	| `"shortest"` \| `"orthogonal"` 	| Тип эвристики                                   	|
| `startNode`                  	| `GraphNode`                	| Стартовый узел пути                             	|
| `endNode`                    	| `GraphNode`                	| Конечный узел пути                              	|
| `param.currentNode`          	| `GraphNode`                	| Текущий узел пути                               	|
| `param.neighborNode`         	| `GraphNode`                	| Соседний узел пути                              	|
| `param.newDistance`          	| `number`                   	| Новое значение пройденной дистанции             	|
| `param.newTurns`             	| `number`                   	| Новое значение счётчика поворотов               	|
| `param.newMidlineNodesCount` 	| `number`                   	| Новое значение счётчика узлов на срединной линии 	|

Возвращает стоимость маршрута, данные которого были переданы в качестве аргументов. Возвращаемая стомость представлена типом `number`.

# `Graph.findPathBetween()`
Главный метод класса `Graph`. Находит самый короткий путь между 2 узлами. В зависимости от переданного `pathFindingMethod` итоговый путь может отличаться. <br>

Алгоритм реализует поиск пути между двумя узлами в графе, используя очередь маршрутов. На каждом шаге он выбирает наименее 'дорогой' маршрут, учитывая параметры, такие как расстояние, количество поворотов и направление движения. <br>

Алгоритм поиска пути выглядит следующим образом:
1. Находим узлы с координатами аналогичными `start` и `end`;
2. Проверяем наличие таких узлов, в случае провала - выкидываем ошибку в консоль;
3. Если передан тип поиска `"straight"` - сразу возвращаем массив из 2 точек;
4. Создаём *очередь* - массив объектов, где каждый объект хранит данные *метрики* текущего маршрута (его протяжённость, стоимость, количество поворотов итд). Сразу же на месте добавляем первый маршрут в объект очереди с пустыми значениями;
5. Создаём цикл, который будет работать пока в очереди есть хотя бы 1 объект;
6. Ключевой шаг алгоритма - в начале каждой иттерации *сортируем очередь по возрастанию стоимости*;
7. Инициализируем локальное значение текущего маршрута в переменную `current`, из неё достём данные по текущему узлу и другим метрикам маршрута;
8. Сравниваем адрес текущего узла маршрута с адресом финиша маршрута, <ins>если адреса совпали - **досрочно** прерываем цикл и вызовращаем массив уже пройденного пути из объекта очереди<ins>;
9. Если адреса не совпали, то запускаем цикл по всем движения ко всем 4 соседям со сторон `up`, `down`, `right` и `left`. Пропускаются соседи, переход к которым вызвал бы движение в обратном направлении. Так же, в случае если узел соседа был посещён несколько раз (данный параметр определяется переменной `maxVisits`), сосед так же пропускается;
10. Внутри иттерации движения обновляем метрики  (новые данные по протяжённости маршрута, информация о количестве поворотов итд);
11. Консолидируем метрики в 1 значение `cost`, передавая их как аргмуенты в метод `Graph.recalcPathCostByHeuristic()` и добавляем данный маршрут в очередь `queue`;
12. Поток исполнения переходит в пункт 6, и снова в начале новой иттерации очередь снова сортируется, перемещая более дешёвые маршруты вперёд;
13. Цикл будет продолжаться пока в очереди есть объекты. Иначе если очередь опустела, а совпадения между `current.node` и `endNode` не произошло - будет возвращён пустой массив и ошибка в консоль. Так же цикл может оборваться на пункте 8, если спустя несколько иттераций мы всё-таки дошли до `endNode`.

| Аргумент            	| Тип данных                               	| Описание                                                                                                    	|
|---------------------	|------------------------------------------	|-------------------------------------------------------------------------------------------------------------	|
| `start`             	| `Point`                                  	| Точка старта пути. Координаты точки старта должна соответствовать координатам одного из узлов `Graph.nodes` 	|
| `end`               	| `Point`                                  	| Точка конца пути. Координаты точки конца должна соответствовать координатам одного из узлов  `Graph.nodes`  	|
| `pathFindingMethod` 	| `"straight"` \| `"shortest"` \| `"orthogonal"` 	| Метод поиска пути                                                                                           	|

# Класс `GraphNode`
Базовая единица всего графа - узел. Узел хранит информацию о своей позиции в пространстве и ссылки на своих соселей `сверху`, `снизу`, `слева` и `справа`. Ссылки может быть и не быть, а вместо неё может быть `null`, если связь недопустима (см. [тут](#graphcreategraphfrom)).

| Свойство                  	| Тип данных            	| Описание                                            	|
|---------------------------	|-----------------------	|-----------------------------------------------------	|
| `GraphNode.x`             	| `number`              	| Позиция по `x`                                      	|
| `GraphNode.y`             	| `number`              	| Позиция по `y`                                      	|
| `GraphNode.r`             	| `number`              	| Радиус узла (для визуализации)                      	|
| `GraphNode.color`         	| `string`              	| Цвет узла (для визуализации)                        	|
| `GraphNode.up`            	| `GraphNode` \| `null` 	| Ссылка на соседний узел сверху                      	|
| `GraphNode.down`          	| `GraphNode` \| `null` 	| Ссылка на соседний узел снизу                       	|
| `GraphNode.left`          	| `GraphNode` \| `null` 	| Ссылка на соседний узел слева                       	|
| `GraphNode.right`         	| `GraphNode` \| `null` 	| Ссылка на соседний узел справа                      	|
| `GraphNode.isMidlineNode` 	| `boolean`             	| Находится ли данный узел на срединной линии или нет 	|
