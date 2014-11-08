$(function() {
	var speed     = 1000;
	var docHeight = $(document).height(),
		docWidth  = $(document).width(),
		circle    = '.circle',
		mouseCircle = '.mc';


    function spiral(direction, el, dropoff) {
    	var docHeight = $(document).height(),
			docWidth  = $(document).width(),
			elHeight   = $(el).height(),
			spiralment = direction + "=" + (docHeight - elHeight - dropoff);
    	console.log(spiralment)
	    $(el).animate({
	    	top: spiralment,
	    }, speed, function() {
	    	$(el).animate({
	    	left: spiralment,
		    }, speed, function() {
		    	if (direction === "+") {
			  		newDirection = "-";
			  	} else {
				  	newDirection = "+"
			  	}
			  	dropoff += 50
			  	if (dropoff < docHeight - elHeight) {
				  	spiral(newDirection, el, dropoff);
			  	}
		    });
		});
    }

    setMiddle(circle);
    setMiddle(mouseCircle);
    $( window ).resize(function() {
  		setMiddle(circle);
	});

	function setMiddle(el) {
	    var	newHeight = $(document).height(),
			newWidth  = $(document).width()
			elHeight   = $(el).height(),
	    	elWidth    = $(el).width(),
	    	middleLeft = (newWidth - elWidth) / 2,
	    	middleTop = (newHeight - elHeight) / 2;

    	$(el).css({top: middleTop, left: middleLeft});
	}

	// $(document).mousemove(function( event ) {
	// 	var elHeight   = $(mouseCircle).height(),
 //    		elWidth    = $(mouseCircle).width(),
 //    		posTop     = event.pageY - (elHeight / 2),
 //    		posLeft    = event.pageX - (elWidth / 2);
	// 	$(mouseCircle).css({top: posTop, left: posLeft});
	// });

	var grow = function(el, amount) {
		console.log("growing");
		var movement = '-=' + (amount / 2),
			growth  = '+=' + amount;
		$(el).animate({
	    	left: movement,
	    	width: growth,
	    	top: movement,
	    	height: growth
		    }, 100, function() {
	    })
	}

	$(mouseCircle).on('click', function() {
		grow(mouseCircle, 45);
	});




    // spiral("+", '.circle', 0);
});