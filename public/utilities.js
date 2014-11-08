
var util = {
	setMiddle: function(container, el) {
	    var	containerHeight = $(container).outerHeight(),
			containerWidth  = $(container).outerWidth(),

			elHeight   = $(el).height(),
	    	elWidth    = $(el).width(),
	    	middleLeft = ((containerWidth - elWidth) / 2),
	    	middleTop = ((containerHeight - elHeight) / 2);

	    console.log(containerHeight + "," + containerWidth);
	    console.log(elHeight +","+ elHeight);

    	$(el).css({"top": middleTop, "left": middleLeft});
	},

	setTopMiddle: function(container, el, top) {
	    var	containerWidth  = $(container).outerWidth(),
	    	elWidth    = $(el).width(),
	    	middleLeft = ((containerWidth - elWidth) / 2);

    	$(el).css({"top": top, "left": middleLeft});
	}
};