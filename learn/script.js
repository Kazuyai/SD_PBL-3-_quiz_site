function TextTypingAnime() {
	$('.TextTyping').each(function () {
		var elemPos = $(this).offset().top - 50;
		var scroll = $(window).scrollTop();
		var windowHeight = $(window).height();
		if (scroll >= elemPos - windowHeight) {
			var thisChild = $(this).children();
			thisChild.each(function (i) {
				var time = 150;
				$(this).delay(time * i).fadeIn(time, function() {
                    if (i === thisChild.length - 1) {
                        $(this).parent().addClass("completed");
                        $(this).parent().addClass("underline");
                    }
                });
			});
		}
	});
}


// 画面スクロール時の処理
$(window).scroll(function () {
	TextTypingAnime();
});

// 画面読み込み時の処理
$(window).on('load', function () {
	var element = $(".TextTyping");
	element.each(function () {
		var text = $(this).html();
		var textbox = "";
		text.split('').forEach(function (t) {
			if (t !== " ") {
				textbox += '<span>' + t + '</span>';
			} else {
				textbox += t;
			}
		});
		$(this).html(textbox);

	});

	TextTypingAnime();
});

/*
$(document).ready(function() {
    var sections = $('section');
    var offsets = sections.map(function() {
        return $(this).offset().top;
    }).get();

    var isScrolling;

    $(window).on('scroll', function() {
        window.clearTimeout(isScrolling);

        isScrolling = setTimeout(function() {
            var scrollTop = $(window).scrollTop();

            var closestSectionIndex = offsets.reduce(function(closestIndex, currentOffset, currentIndex) {
                return Math.abs(currentOffset - scrollTop) < Math.abs(offsets[closestIndex] - scrollTop) ? currentIndex : closestIndex;
            }, 0);

            var closestSectionOffset = offsets[closestSectionIndex];

            $('html, body').animate({
                scrollTop: closestSectionOffset
            }, 300);

        }, 66);
    });
});
*/
/*
$(document).ready(function() {
    var sections = $('section');
    var offsets = sections.map(function() {
        return $(this).offset().top;
    }).get();

    var isScrolling;

    $(window).on('scroll', function() {
        window.clearTimeout(isScrolling);

        isScrolling = setTimeout(function() {
            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();
            var middleOfScreen = scrollTop + windowHeight / 2;

            var closestSectionIndex = offsets.findIndex(function(offset, index) {
                var nextOffset = index + 1 < offsets.length ? offsets[index + 1] : Infinity;
                return middleOfScreen >= offset && middleOfScreen < nextOffset;
            });

            if (closestSectionIndex !== -1) {
                var closestSectionOffset = offsets[closestSectionIndex];
                $('html, body').animate({
                    scrollTop: closestSectionOffset
                }, 300);
            }

        }, 66);
    });
});
*/