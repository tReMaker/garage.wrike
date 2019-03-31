var MyGarage = (function () {
    function MyGarage() {
        this.data = {
            delay: 3000,
            delay_click: 200,
            board: null,
            rows: [],
            frozen: [],
            game: [],
            sandbox:[],
            room: [[0, 1, 2, 5, 6],[3, 4, 8, 9, 14],[18, 19, 22, 23, 24],[10, 15, 16, 20, 21],[7, 11, 12, 13, 17]]
        };

        this.cell_iter = 0;
        this.target_value = 0;
    };

    MyGarage.prototype.init = function(delay, delay_click) {
        this.data.board = window.document.getElementsByTagName("board");
        this.data.rows = [];
        this.data.frozen = [];
        this.data.game = [];
        this.data.sandbox = [];
        this.data.delay = delay;
        this.data.delay_click = delay_click;

        if (typeof this.data.board == "undefined" || this.data.board.length != 1) {
            alert("board not found");
            return;
        }

        this.data.board = this.data.board[0];

        var rows = this.data.board.getElementsByClassName("board-row");

        if (rows.length != 5) {
            alert("row not found");
            return;
        }

        var re = /.*(\d).*/;

        for (var i = 0; i < rows.length; i++) {
            this.data.rows[i] = rows[i].getElementsByTagName("cell");

            if (this.data.rows[i].length != 5) {
                alert("cell not found");
                return;
            }


            for (var j = 0; j < this.data.rows[i].length; j++) {
                var img = this.data.rows[i][j].getElementsByTagName("img");

                if (img.length == 1) {
                    img = img[0];
                    var result = re.exec(img.src);

                    if (result) {
                        this.data.game.push(parseInt(result[1], 10));
                        this.data.sandbox.push(parseInt(result[1], 10));
                        this.data.frozen.push(i * 5 + j);
                    }
                } else {
                    this.data.game.push(0);
                    this.data.sandbox.push(0);
                }
            }
        }

        this.findAnswer();
    };

    MyGarage.prototype.findAnswer = function() {
        var len = this.data.game.length;

        while (true) {
            var bUpdate = false;

            for (var i = 0; i < len; i++) {

                if (this.data.sandbox[i] == 0) {
                    var answer = this.getAnswer(i);

                    if (answer.length == 1) {
                        this.data.game[i] = answer[0];
                        this.data.sandbox[i] = answer[0];
                        bUpdate = true;
                    }
                }
            }

            if (!bUpdate) {
                break;
            }
        }

        this.showHelp();
    };

    MyGarage.prototype.getAnswer = function(index) {
        var result = [],
            arExist = [],
            room = this.getRoomByCell(index),
            row = Math.floor(index / 5),
            cell = index % 5;

        for (var i = 0; i < 5; i++) {
            var index = this.data.room[room][i],
                value = this.data.sandbox[index];

            if (value > 0 && !this.inArray(value, arExist)) {
                arExist.push(value);
            }
        }

        for (var c = 0; c < 5; c++) {
            var i = row * 5 + c,
                value = this.data.sandbox[i];

            if (value > 0 && !this.inArray(value, arExist)) {
                arExist.push(value);
            }
        }


        for (var r = 0; r < 5; r++) {
            var i = r * 5 + cell,
                value = this.data.sandbox[i];

            if (value > 0 && !this.inArray(value, arExist)) {
                arExist.push(value);
            }
        }

        for (var v = 1; v <= 5; v++) {
            if (!this.inArray(v, arExist)) {
                result.push(v);
            }
        }

        return result;
    };

    MyGarage.prototype.getRoomByCell = function(index) {
        var result = -1;

        for (var r = 0; r < 5; r++) {
            for (var i = 0; i < 5; i++) {
                if (index == this.data.room[r][i]) {
                    result = r;
                    break;
                }
            }

            if (result != -1) {
                break;
            }
        }

        return result;
    };

    MyGarage.prototype.showHelp = function() {
        this.cell_iter = 0;
        this.target_value = 0;
        setTimeout(this.callback.bind(this), this.data.delay);
    };

    MyGarage.prototype.callback = function() {
        while (this.inArray(this.cell_iter, this.data.frozen)) {
            this.cell_iter++;
        }

        if (this.cell_iter >= 25) {
            return;
        }

        var delay = this.data.delay_click,
            value = this.data.sandbox[this.cell_iter];

        if (this.target_value == 0) {
            this.target_value = value;
        }

        if (value > 0) {
            var row = Math.floor(this.cell_iter / 5),
                cell = this.cell_iter % 5;

            this.fireEvent(this.data.rows[row][cell], "mousedown");
            this.target_value--;
        }

        if (this.target_value == 0) {
            this.cell_iter++;
            delay = this.data.delay;
        }

        if (this.cell_iter < 25) {
            setTimeout(this.callback.bind(this), delay);
        }
    };

    MyGarage.prototype.inArray = function(value, arr) {
        var bExist = false,
            len = arr.length;

        for (var i = 0; i < len; i++) {
            if (value == arr[i]) {
                bExist = true;
                break;
            }
        }

        return bExist;
    };

    MyGarage.prototype.fireEvent = function(node, eventName) {
        var doc;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType == 9){
            doc = node;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + node.id);
        }

         if (node.dispatchEvent) {
            var eventClass = "";

            switch (eventName) {
                case "click":
                case "mousedown":
                case "mouseup":
                    eventClass = "MouseEvents";
                    break;

                case "focus":
                case "change":
                case "blur":
                case "select":
                    eventClass = "HTMLEvents";
                    break;

                default:
                    throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                    break;
            }
            var event = doc.createEvent(eventClass);
            event.initEvent(eventName, true, true);

            event.synthetic = true;
            node.dispatchEvent(event, true);
        } else  if (node.fireEvent) {
            var event = doc.createEventObject();
            event.synthetic = true;
            node.fireEvent("on" + eventName, event);
        }
    };

    return MyGarage;
})();
var my_bot = new MyGarage(); my_bot.init(500, 200);
