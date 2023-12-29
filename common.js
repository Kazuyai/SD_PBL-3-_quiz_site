$(".openbtn").click(function () {
    $(this).toggleClass('active');
    $("#g-nav").toggleClass('panelactive');
    $(".circle-bg").toggleClass('circleactive');
});

$(window).on('load',function(){
    $("#splash").delay(1500).fadeOut('slow');
    $("#splash_logo").delay(1200).fadeOut('slow');
});

$(window).scroll(function (){
	$('.fadein').each(function(){
		var elemPos = $(this).offset().top,
		scroll = $(window).scrollTop(),
		windowHeight = $(window).height();

			if (scroll > elemPos - windowHeight + 150){
				$(this).addClass('in-view');
			}
	});
});