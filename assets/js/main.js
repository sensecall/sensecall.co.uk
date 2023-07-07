"use strict";

//Toggle navigation

$(".nav-open").on("click", function(e){
 e.preventDefault();
 $(".full-screen-nav").addClass("active");
})

$(".nav-close").on("click", function(e){
 e.preventDefault();
 $(".full-screen-nav").removeClass("active");
})


//Toggle collapsible navigation

$(".collapsible-nav li").on("click", function(){
	$(this).toggleClass("nav-active");
})