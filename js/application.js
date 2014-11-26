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

        var a = $("<a>").attr("href", dataUrl).attr("download", "comic.png").appendTo("body");

        a[0].click();

        a.remove();
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
  var group = new Kinetic.Group({
    x: 110,
    y: 110,
    draggable: true
  });

  layer.add(group);


  var img = new Kinetic.Image({
    image: imageObj,
    x: 0,
    y: 0,
    height: imageObj.height,
    width: imageObj.width,
    brightness: 0,
    name: "image"
  })

  group.add(img);
  addAnchor(group, 0, 0, "topLeft");
  addAnchor(group, imageObj.width, 0, "topRight");
  addAnchor(group, imageObj.width, imageObj.height, "bottomRight");
  addAnchor(group, 0, imageObj.height, "bottomLeft");

  group.on("dragstart", function() {
    this.moveToTop();
  });


  group.on('mouseover', function(){
    document.body.style.cursor = 'pointer';
    this.find('Circle').show();
    img.fill('rgba(0, 0, 0, 0.3)');
    layer.draw();
  });
  group.on('mouseout', function(){
      document.body.style.cursor = 'default'
      group.find('Circle').hide()
      img.fill(null)
      layer.draw();
  })




  stage.add(layer);
}


function drawBackground(stage,imageObj){

  var layer = new Kinetic.Layer();
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

function addAnchor(group, x, y, name) {
  var stage = group.getStage();
  var layer = group.getLayer();

  var anchor = new Kinetic.Circle({
    x: x,
    y: y,
    stroke: "#666",
    fill: "#ddd",
    strokeWidth: 2,
    radius: 12,
    name: name,
    draggable: true,
    visible: false
  });

  anchor.on("dragmove", function() {
    update(group, this);
    layer.draw();
  });
  anchor.on("mousedown touchstart", function() {
    group.setDraggable(false);
    this.moveToTop();
  });
  anchor.on("dragend", function() {
    group.setDraggable(true);
    layer.draw();
  });

  group.add(anchor);
}


function update(group, activeHandle) {
  var topLeft = group.get(".topLeft")[0],
  topRight = group.get(".topRight")[0],
  bottomRight = group.get(".bottomRight")[0],
  bottomLeft = group.get(".bottomLeft")[0],
  image = group.get(".image")[0],
  activeHandleName = activeHandle.getName(),
  newWidth,
  newHeight,
  minWidth = 50,
  minHeight = 50,
  oldX,
  oldY,
  imageX,
  imageY;

  // Update the positions of handles during drag.
  // This needs to happen so the dimension calculation can use the
  // handle positions to determine the new width/height.
  switch (activeHandleName) {
    case "topLeft":

      oldY = topRight.getY();
      oldX = bottomLeft.getX();
      topRight.setY(activeHandle.getY());
      bottomLeft.setX(activeHandle.getX());
      break;
    case "topRight":
      oldY = topLeft.getY();
      oldX = bottomRight.getX();
      topLeft.setY(activeHandle.getY());
      bottomRight.setX(activeHandle.getX());
      break;
    case "bottomRight":

      oldY = bottomLeft.getY();
      oldX = topRight.getX();
      bottomLeft.setY(activeHandle.getY());
      topRight.setX(activeHandle.getX());
      break;
    case "bottomLeft":
      oldY = bottomRight.getY();
      oldX = topLeft.getX();
      bottomRight.setY(activeHandle.getY());
      topLeft.setX(activeHandle.getX());
      break;
  }



  // Calculate new dimensions. Height is simply the dy of the handles.
  // Width is increased/decreased by a factor of how much the height changed.
  newHeight = bottomLeft.getY() - topLeft.getY();
  newWidth = image.getWidth() * newHeight / image.getHeight();

  // It's too small: move the active handle back to the old position
  if( newWidth < minWidth || newHeight < minHeight ){
    activeHandle.setY(oldY);
    activeHandle.setX(oldX);
    switch (activeHandleName) {
      case "topLeft":
        topRight.setY(oldY);
        bottomLeft.setX(oldX);
        break;
      case "topRight":
        topLeft.setY(oldY);
        bottomRight.setX(oldX);
        break;
      case "bottomRight":
        bottomLeft.setY(oldY);
        topRight.setX(oldX);
        break;
      case "bottomLeft":
        bottomRight.setY(oldY);
        topLeft.setX(oldX);
        break;
      }
    }


  newHeight = bottomLeft.getY() - topLeft.getY();
  //comment the below line and uncomment the line below tha line to allow free resize of the images because the below line preserves the scale and aspect ratio
  newWidth = image.getWidth() * newHeight / image.getHeight();//for restricted resizing
  //newWidth = topRight.getX() - topLeft.getX();//for free resizing

  // Move the image to adjust for the new dimensions.
  // The position calculation changes depending on where it is anchored.
  // ie. When dragging on the right, it is anchored to the top left,
  //     when dragging on the left, it is anchored to the top right.
  if(activeHandleName === "topRight" || activeHandleName === "bottomRight") {
    image.setPosition({x: topLeft.getX(), y: topLeft.getY()});
  } else if(activeHandleName === "topLeft" || activeHandleName === "bottomLeft") {
    image.setPosition({x: topRight.getX() - newWidth, y: topRight.getY()});
  }

  imageX = image.getX();
  imageY = image.getY();

  // Update handle positions to reflect new image dimensions
  topLeft.setPosition({x: (imageX), y: (imageY)});
  topRight.setPosition({x: imageX + newWidth, y: imageY});
  bottomRight.setPosition({x: imageX + newWidth, y: imageY + newHeight});
  bottomLeft.setPosition({x: imageX, y: imageY + newHeight});




  // Set the image's size to the newly calculated dimensions
  if(newWidth && newHeight) {
    image.setSize({width: newWidth, height: newHeight});
  }
}
