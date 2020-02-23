import noUiSlider from 'nouislider';
import Inputmask from "inputmask";
import './jquery.nice-select';
$(document).ready(function() {
	$('select').niceSelect();
	$(".main-form__step-item-slider").ionRangeSlider({
		from: 2,
		values: [
			"1 мес", "3 мес", "6 мес", "1 год", "3 года", "5 лет"
		]
	});
	let im = new Inputmask("+7 (999) 999-9999");
	im.mask($("input[name=phone]"));
	$('.main-form').click((e) => {
		if(e.target.classList.contains('main-form__step-item-button')){
			$('.main-form')[0].classList.toggle('main-form--step');
		}
	});

});