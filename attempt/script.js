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