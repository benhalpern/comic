//focusedText needs to be a global variable

var focusedText,
    comicName = "comic",
    comicTitle = "Comic With",
    focusRectW = 200,
    focusRectH = 60;

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
    drawImage(stage,this,$(this).data("character"));
    comicName = comicName + "_" + $(this).data("character")
    comicTitle = comicTitle + " " + $(this).data("character")
  })

  $('#tv').dblclick(function(e){
    drawBubble(stage,e.pageX -50,e.pageY -50,$("img.active")[0]);
  })

  $("#save").click(function(){
    stage.toDataURL({
      callback: function(dataUrl) {

        var a = $("<a>").attr("href", dataUrl).attr("download", comicName + ".png").appendTo("body");

        a[0].click();

        a.remove();
      }
    })
    return false;
  })


  $("#imgur").not( ".uploaded" ).click(function(){
    $("#imgur").animate({"width":"476px"},450)
    setTimeout(function(){
      $("#imgur").html('Uploading to Imgur')
      $("#uploaded").animate({"width":"370px"},4200)

    },560)
    stage.toDataURL({
      callback: function(dataUrl) {
        $.ajax({
          url: 'https://api.imgur.com/3/image',
          headers: {
            'Authorization': 'Client-ID d2c784f95f3c2df'
          },
          type: 'POST',
          data: {
            'type': 'base64',
            'image': dataUrl.split(',')[1],
            'name': comicName + ".png",
            'title': comicTitle,
            'description': "Made with Comic Maker"
          },
          success: function(response) {
            $("#uploaded").animate({"width":"476px"},180);
            $("#uploaded").addClass("uploading");
            $("#uploaded").addClass("uploaded");
            $(".hidden-text").text("Uploaded to Imgur");
            $("#uploaded").attr("href", 'http://imgur.com/' + response["data"]["id"]);
            $('.hidden-text').animate({"opacity":"1"},380);
          }
        });
      }
    })
    return false;
  })



  $("select").change(function(){
    $(".image").addClass("hidden")
    $('*[data-character="' + this.value + '"]').removeClass("hidden");
  })

  $("#bubbles img").click(function(){
    $("#bubbles img").removeClass("active");
    $(this).addClass("active");
    drawBubble(stage,360,120,$("img.active")[0]);


  })


  //text edit


  //click outside TV
  $(document).on('mousedown', function(e) {
    if (focusedText != undefined) {
      focusedText.unfocus(e);
      focusedText = undefined;
    }
  });


  // when clicked inside TV
  $(document).on('mousedown', '#tv', function(e) {
    // if focusedText exists, two possibilities:
    // Either just clicked on an existing text, or
    // Clicked outside a focused text.
    if (focusedText != undefined) {
      if (focusedText.checkClick()) {
        focusedText.findCursorPosFromClick(true);
      }
      else {

        var layer = focusedText.getLayer(),
        newX = focusedText.getX() - focusedText.getParent().getX(),
        newY = focusedText.getY() - focusedText.getParent().getY();
        focusedText.unfocus(e);

        focusedText.setPosition({
          x: newX,
          y: newY,
        });
        if ( focusedText["attrs"]["text"].length > 1 ){
          focusedText = undefined
          console.log("there is text")
        }

        layer.draw();
      }
    }
    else{
      console.log("focusing editor")

    }
    return false;
  });

  $(document).on('mouseup', '#tv', function(e) {
    if(focusedText != undefined && focusedText["attrs"]["text"].length < 2 ){
      addTextEdit(focusedText.getParent(),
      focusedText.getParent().getX() + 50,
      focusedText.getParent().getY() + 50)
    }


  });



})


function drawImage(stage,imageObj,character){
  var layer = new Kinetic.Layer();


  //bart
  var group = new Kinetic.Group({
    x: 110,
    y: 180,
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
  addDeleteButton(group, imageObj.width - 38, -18);
  addLayerDownButton(group, imageObj.width - 102, -18);
  addLayerUpButton(group, imageObj.width - 75, -18);

  group.on("dragstart", function() {
    this.moveToTop();
  });

  group.character = character

  group.on('mouseover', function(){
    document.body.style.cursor = 'pointer';
    this.find('Circle').show();
    this.find('.delete').show();
    this.find('.layerUp').show();
    this.find('.layerDown').show();

    img.fill('rgba(0, 0, 0, 0.3)');
    layer.draw();
  });
  group.on('mouseout', function(){
      document.body.style.cursor = 'default'
      group.find('Circle').hide()
      this.find('.delete').hide();
      this.find('.layerUp').hide();
      this.find('.layerDown').hide();


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

function drawBubble(stage,x,y,activeBubble){

  var layer,group,bubble,imageObj = activeBubble,
      imageHeight = 200,
      imageWidth = 300;
  if( focusedText != undefined ){
    focusedText.unfocus();
  }
  layer = new Kinetic.Layer();
  bubble = new Kinetic.Image({
    image: imageObj,
    x: -(imageWidth/2),
    y: -(imageHeight/2),
    height: imageHeight,
    width: imageWidth,
    brightness: 0,
    name: "image"
  })

  group = new Kinetic.Group({
    x: x,
    y: y,
    draggable: true
  });



  layer.add(group);
  group.add(bubble);
  stage.add(layer);
  addTextEdit(group,x + 50,y + 50);
  addAnchor(group, -(imageWidth/2), -(imageHeight/2), "topLeft");
  addAnchor(group, imageWidth/2, -(imageHeight/2), "topRight");
  addAnchor(group, imageWidth/2, imageHeight/2, "bottomRight");
  addAnchor(group, -(imageWidth/2), imageHeight/2, "bottomLeft");

  addDeleteButton(group, (imageWidth/2) - 38, -(imageHeight/2) -18);
  addLayerDownButton(group, (imageWidth/2) - 102, -(imageHeight/2) -18);
  addLayerUpButton(group, (imageWidth/2) - 75, -(imageHeight/2) -18);

  group.on('mouseover', function(){
    document.body.style.cursor = 'pointer';
    this.find('Circle').show();
    this.find('.delete').show();
    this.find('.layerUp').show();
    this.find('.layerDown').show();

    layer.draw();
  });
  group.on('mouseout', function(){
    document.body.style.cursor = 'default'
    group.find('Circle').hide()
    this.find('.delete').hide();
    this.find('.layerUp').hide();
    this.find('.layerDown').hide();

    layer.draw();
  })

  // add the layer to the stage

}


function addTextEdit(group,x,y) {
  var newText = new Kinetic.EditableText({
    // find click position.
    x: x + getFullOffset().left - 90,
    y: y + getFullOffset().top -11,
    fontFamily: 'Comic Sans MS',
    fill: '#000000',
    //text: "placeholder",
    // pasteModal id to support ctrl+v paste.
    pasteModal: "pasteModalArea",
    draggable: true
  });
  group.add(newText);

  newText.focus();
  focusedText = newText;

  //focusedText.setPosition({x: -88, y: -35});
  newText.on("click", function(evt) {
    evt.cancelBubble = true;
    console.log(evt['evt'])
    console.log(group.getX())
    this.setPosition({
      x: group.getX() + newText.getX(),
      y: group.getY() + newText.getY(),
    });
    this.focus();
    self.focusedText = this;
    return false
  })

  newText.on("mouseover", function(){
    document.body.style.cursor = 'text';
  })
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

function addDeleteButton(group, x, y){

  var stage = group.getStage();
  var layer = group.getLayer();

  var butt = new Kinetic.Group({
    x: x,
    y: y,
    name: 'delete',
    visible: false

  });

  var text = new Kinetic.Text({
    x: 0,
    y: 0,
    text: 'x',
    fontSize: 31,
    fontFamily: 'Helvetica',
    fill: '#fff',
    name: 'delete'
  });

  var circle = new Kinetic.Circle({
    x: 7.5,
    y: 18,
    stroke: "#ddd",
    fill: "#000",
    strokeWidth: 2,
    radius: 12
  });

  butt.on("mousedown", function() {
    layer.remove(group)
    comicName = comicName.replace("_" + group.character, "")
    comicTitle = comicTitle.replace(" " + group.character, "")
  });

  butt.add(circle)
  butt.add(text)

  group.add(butt);


}

function addLayerUpButton(group, x, y){
  var stage = group.getStage();
  var layer = group.getLayer();

  var butt = new Kinetic.Group({
    x: x,
    y: y,
    name: 'layerUp',
    visible: false
  });

  var text = new Kinetic.Text({
    x: -1.5,
    y: -1,
    text: '+',
    fontSize: 31,
    fontFamily: 'Helvetica',
    fill: '#fff',
  });

  var circle = new Kinetic.Circle({
    x: 7.5,
    y: 18,
    stroke: "#ddd",
    fill: "#000",
    strokeWidth: 2,
    radius: 12
  });

  butt.on("mousedown", function() {
    layer.moveUp();
  });

  butt.add(circle)
  butt.add(text)

  group.add(butt);

}

function addLayerDownButton(group, x, y){
  var stage = group.getStage();
  var layer = group.getLayer();

  var butt = new Kinetic.Group({
    x: x,
    y: y,
    name: 'layerDown',
    visible: false
  });

  var text = new Kinetic.Text({
    x: 2,
    y: 0,
    text: '-',
    fontSize: 31,
    fontFamily: 'Helvetica',
    fill: '#fff',
  });

  var circle = new Kinetic.Circle({
    x: 7.5,
    y: 18,
    stroke: "#ddd",
    fill: "#000",
    strokeWidth: 2,
    radius: 12
  });

  butt.on("mousedown", function() {
    if( layer.getZIndex() > 1 ){
      layer.moveDown();
    }
  });

  butt.add(circle)
  butt.add(text)

  group.add(butt);

}



function update(group, activeHandle) {
  var topLeft = group.get(".topLeft")[0],
  topRight = group.get(".topRight")[0],
  bottomRight = group.get(".bottomRight")[0],
  bottomLeft = group.get(".bottomLeft")[0],
  deleteButton = group.get(".delete")[0],
  layerDownButton = group.get(".layerDown")[0],
  layerUpButton = group.get(".layerUp")[0],
  image = group.get(".image")[0],
  activeHandleName = activeHandle.getName(),
  newWidth,
  newHeight,
  minWidth = 60,
  minHeight = 60,
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
  //comment the below line and uncomment the line below tha line to allow
  //free resize of the images because the below line preserves the scale and aspect ratio
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
  deleteButton.setPosition({x: imageX + newWidth -  38, y: imageY -18});
  layerUpButton.setPosition({x: imageX + newWidth -  75, y: imageY -18});
  layerDownButton.setPosition({x: imageX + newWidth -  102, y: imageY -18});

  if(newWidth < 130){
    layerDownButton.hide();
    layerUpButton.hide();
  }
  else{
    layerDownButton.show();
    layerUpButton.show();
  }

  // Set the image's size to the newly calculated dimensions
  if(newWidth && newHeight) {
    image.setSize({width: newWidth, height: newHeight});
  }
}

// helper function for mouse click position.
function getFullOffset() {
  var container = $("#tv");
  return {
    left: container.scrollLeft() - container.offset().left,
    top: container.scrollTop() - container.offset().top
  }
}
