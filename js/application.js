$(document).ready(function(){

  //onload

  var stage = new Kinetic.Stage({
    container: "tv",
    width: 800,
    height: 600
  })


  var bgObj = new Image();
  bgObj.onload = function(){
    drawBackground(stage,this)
  }
  bgObj.src= './images/room.jpg'



  //events

  $('.image').click(function(){
    drawImage(stage,this)
  })

  $("#save").click(function(){
    stage.toDataURL({
      callback: function(dataUrl) {
        //document.getElementById('prova').src=dataUrl;
        window.open(dataUrl);
      }
    })
    return false;
  })

  $("select").change(function(){
    $(".image").addClass("hidden")
    $('*[data-character="' + this.value + '"]').removeClass("hidden");
  })


})


function drawImage(stage,imageObj){
  var layer = new Kinetic.Layer();


  //bart
  var bartImg = new Kinetic.Image({
    image: imageObj,
    x: 20,
    y:20,
    draggable: true
  })

  bartImg.on('mouseover', function(){
    document.body.style.cursor = 'pointer';
  });
  bartImg.on('mouseout', function(){
    document.body.style.cursor = 'default'
  })

  layer.add(bartImg);
  stage.add(layer);
}


function drawBackground(stage,imageObj){

  var layer = new Kinetic.Layer();
  //bart
  var img = new Kinetic.Image({
    image: imageObj,
    x: 0,
    y:0,
    width: 800,
    height: 600,
    draggable: false
  })

  layer.add(img);
  stage.add(layer);
}
