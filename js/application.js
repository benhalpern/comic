$(document).ready(function(){

  var stage = new Kinetic.Stage({
    container: "tv",
    width: 800,
    height: 600
  })


  var bgObj = new Image();
  bgObj.onload = function(){
    drawBackground(stage,this)
  }

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

  bgObj.src= 'http://fc07.deviantart.net/fs70/i/2012/114/c/2/living_room_by_juniorgustabo-d4xfzug.png'

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
