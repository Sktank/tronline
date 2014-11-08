// =========================================================
//                Queue Implementation
// =========================================================

    function QueueNode(object) {
        this.next = null;
        this.value = object;
    }

    exports.Queue = function () {
        var self = this;
        this.tail = null;
        this.head = null;
        this.length = 0;

        this.enqueue = function(object) {
            var newNode = new QueueNode(object);
            if (self.length > 0) {
                self.tail.next = newNode;
            }
            else {
                self.head = newNode;
            }
            self.tail = newNode;
            self.length = this.length + 1;
            return true;
        };

        this.dequeue = function() {
            if (self.length > 0) {
                var ret = self.head.value;
                self.head = self.head.next;
                self.length = self.length - 1;
                return ret;
            }
            return null;
        };

        this.hasQueued = function(num) {
            var current = this.head;
            var ready = 0
            var traversed = 0;
            if (this.length < num) {
                return false;
            }
            while (traversed < this.length) {
                traversed++;
                if (current.value.queued === true) {
                    ready++;
                }
                if (ready == num) {
                    return traversed;
                }
                current = current.next;
            }
            return false;
        }
    };