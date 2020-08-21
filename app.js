//BUDGETCONTROLLER
var budgetController = (function () {
    var Income, Expense, data, calculateTotal;
    Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += parseFloat(cur.value);
        });

        data.totals[type] = sum;
    };

    data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            //id = 3
            // we have to remove index pf that element not the id
            // ids = [2,3,5,6,7];
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculatePercentages: function () {
            /*needed total income and individual income*/
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });


        },
        getPercentages: function () {
            var allPercentages;
            allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },


        calculateBudget: function () {
            var budget;
            // calculate the total expense and income
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalExp: data.totals.exp,
                totalInc: data.totals.inc,
                percentage: data.percentage
            }
        },


        testing: function () {
            return data.allItems;

        }
    };



})();

//UICONTROLLER
var UIController = (function () {
    var DOMstrings, formatNumber;
    DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'


    };
    formatNumber = function (num, type) {
        var numSplit, int, dec, sign;
        // + or - for numbers
        //exatly 2 decimal degits

        // 2310.2345 -> 2, 310.46;

        num = Math.abs(num); // no sign
        num = num.toFixed(2); // exactly 2 deimal digits

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length <= 6 && int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }
        else if (int.length <= 9 && int.length > 6) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
        }
        else if (int.length > 9) {
            int = int.substr(0, int.length - 9) + ',' + int.substr(int.length - 9, 3) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
            ;
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    };

    nodeForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        };
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value

            }
        },
        addListItem: function (type, obj) {
            var html, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
            }

            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // fields is list here so convert to array.add... slice creates a copy of arry
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },
        displayPercentages: function (percentageArr) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentageLabel); // list of all the fields

            nodeForEach(fields, function (current, index) {
                if (percentageArr[index] > 0) {
                    current.textContent = percentageArr[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });

        },

        displayBudget: function (obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.budgetExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayMonth: function () {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novembar', 'Decembar'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            )
            nodeForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

//APPCONTROLLER
var appController = (function (budgetCtrl, UICtrl) {
    var ctrlAddItem, ctrlDeleteItem, setupEventListeners, input, newItem, DOM, updateBudget, updatePercentages, budget, percentages;

    setupEventListeners = function () {

        //Excessing dom  class namefrom ui
        DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    updateBudget = function () {

        // 5. calculate the budget
        budgetCtrl.calculateBudget();
        // return the budget
        budget = budgetCtrl.getBudget();

        // 6.update the UI with new budget
        UICtrl.displayBudget(budget);

    }
    updatePercentages = function () {
        // 1.calculate the percentages
        budgetCtrl.calculatePercentages();
        //2. Read the percentages from the  budget controller
        percentages = budgetCtrl.getPercentages();
        //3. display the percentages to the ui.
        UICtrl.displayPercentages(percentages);
    };

    ctrlAddItem = function () {
        // TODO LIST

        // 1. get input
        input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. store the input in database
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add new item to UI
            UICtrl.addListItem(input.type, newItem);
            //4. clearing the fields:
            UICtrl.clearFields();
            //5.updateBudget
            updateBudget();
            // 6. calculate and update percentages
            updatePercentages();
        }



    };
    ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1.delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2.delete the item from the  user interface
            UICtrl.deleteListItem(itemID);

            // 3.udpate and show the new budget
            updateBudget();
            // 4. calculate and update percentages
            updatePercentages();

        }
    };


    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalExp: 0,
                totalInc: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

appController.init();