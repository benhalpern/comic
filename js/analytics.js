$(document).ready(function(){

  //Adding a scene

  $(".add-scene").click(function(){
    ga('send', 'event', 'add scene', 'click', $(".tv:visible").length);
  })

  $("#imgur").click(function(){
    ga('send', 'event', 'click upload to imgur', 'click', $(".tv:visible").length);
  })

  $("#collections").change(function(){
    ga('send', 'event', 'change collection', 'change', $( "#collections option:selected" ).text());
  })

  $( ".left-controls" ).delegate( ".character", "click", function(e) {
    ga('send', 'event', 'click character', 'click', $(this).text());
  })

  $(".bubble").click(function(){
    ga('send', 'event', 'bubble clicked', 'click', "bubble clicked");
  })

});
