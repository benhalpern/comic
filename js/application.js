//focusedText needs to be a global variable

var focusedText,
    comicName = "comic",
    comicTitle,
    focusRectW = 200,
    focusRectH = 60,
    serverDomain = "http://comicmaker.herokuapp.com",
    stage,
    stages = [],
    results = [],
    uploadedAlbum = false;
$(document).ready(function(){
  loadCollections()

  //onload

  stage = new Kinetic.Stage({
    container: "tv_0",
    width: 800,
    height: 500
  });

  stages.push(stage);

  loadBackgroundImage();
  //events

  $( "body" ).delegate( ".image", "click", function() {
    var myImage = new Image();
    myImage.crossOrigin = ""
    $(myImage).one("load", function() {
      drawImage(stage,myImage,$(this).data("character"));
    }).attr("src", $(this).data('fitted'));

    comicName = comicName + "_" + $(this).data("character")
    comicTitle = comicTitle + " " + $(this).data("character")
  })

  $( "body" ).delegate( ".tv:not(.active)", "click", function() {
    $('.tv').removeClass("active")
    $(this).addClass("active")

    stage = stages[$('.tv').index(this)]


  })

  $( "body" ).delegate( ".background-image", "click", function() {
    var myImage = new Image(), thisBg = $(this);
    comicTitle = $("#collections option:selected").text() + " Comic:"
    $(".bg-holder.active").hide();
    $('.tv').removeClass("active")
    $(".tv:last").addClass("active")
    $(".tv.active").show();
    setTimeout(function(){
      $("#controls a").slideDown('slow');

    },200)
    stage = stages[$('.tv').index($('.tv.active'))]

    myImage.crossOrigin = ""
    drawBackground(stage,$("img",this)[0]);
    setTimeout(function(){
      $(myImage).one("load", function() {
        drawBackground(stage,myImage);
        console.log("image loaded")
      }).attr("src", thisBg.data('fitted'));

    },70)
  })

  $( "body" ).delegate( ".add-scene", "click", function() {
    if($(".bg-holder:visible").length == 0){
      var random = Math.floor(Math.random() * 1000) + 1
      lastTv = $(".tv.active:last")
      console.log(lastTv.offset().top + 500)
      $(".tv,.bg-holder").removeClass("active")
      lastTv.after('<div id="bg_'+random+'" class="active canvas bg-holder"></div><div id="tv_'+random+'" class="active canvas tv"></div><br><br>')
      $("body").animate({ scrollTop: lastTv.offset().top + 400}, 400);
      $("#bg_"+random).html($("#bg_0").html())
      stage = new Kinetic.Stage({
        container: "tv_" + random,
        width: 800,
        height: 500
      });
      stages.push(stage);
    }
    else{
      $("body").animate({ scrollTop: $(".bg-holder:visible").offset().top + 400}, 400);

    }



  })

  $("#save").click(function(){
    if($(".tv:visible").length > 0){
      $.each(stages, function( index, stage ) {
        stage.toDataURL({
          callback: function(dataUrl) {
            var a = $("<a>").attr("href", dataUrl).attr("download", comicName + ".png").appendTo("body");
            a[0].click();
            a.remove();
          }
        })
      });
    };
    return false;
  })

  $('body').delegate('.pose','mouseenter', function(event) {
    var preloader = new Image(),
    thumb = $(this).find('img').data("thumb"),
    fitted = $(this).find('img').data("fitted"),
    thumbImage = new Image(),
    pose = this;
    thumbImage.crossOrigin = ""
    $(thumbImage).one("load", function() {
      $('.thumb-preview',pose).html('<img crossorigin="" src="'+thumb+'">')
      $(pose).find('.thumb-preview').animate({"opacity":"1"},150);
    }).attr("src", thumb);


    preloader.crossOrigin = ""
    preloader.src = fitted
  });

  $('body').delegate('.pose','mouseleave', function(event) {
    $(this).find('.thumb-preview').animate({"opacity":"0"},40);
  });
  $('body').delegate('.pose','click', function(event) {
    $(this).find('.thumb-preview').animate({"opacity":"0"},40);
  });


  $("#imgur").click(function(){
    //do it for all stages
    if($(".tv:visible").length > 0){
      uploadedAlbum = false;
      $("#uploaded,#reddit").slideUp();
      inchForward(13);
      $(this).addClass('uploading')
      $(this).text('Uploading to Imgur')
      $.each(stages, function( index, stage ) {
        stage.toDataURL({
          callback: function(dataUrl) {
            uploadImage(dataUrl,index);
          }
        })
      });
    }
    else{
      $("#imgur").text('No Scene Detected')
      $("#imgur").addClass('no-scene')

      setTimeout(function(){
        $("#imgur").text('Upload to Imgur')
        $("#imgur").removeClass('no-scene')

      },500)
    }
    return false;
  })


  $("#collections").change(function(){
    loadCharacters(this.value)
    loadBackgrounds(this.value)
  })
  $( "body" ).delegate( ".character", "click", function() {
    loadPoses($(this).data("id"),$(this).text())
    $(".character").removeClass("active")
    $(this).addClass("active")
  })


  $("#bubbles img").click(function(){
    //var adjustedY = ($('.tv').index($('.tv.active')) * 300)
    //console.log(adjustedY)
    $("#bubbles img").removeClass("active");
    $(this).addClass("active");
    console.log(stage.getY())
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
  $(document).on('mousedown', '.tv', function(e) {
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
        }

        layer.draw();
      }
    }
    return false;
  });

  $(document).on('mouseup', '.tv', function(e) {
    if(focusedText != undefined && focusedText["attrs"]["text"] && focusedText["attrs"]["text"].length < 2 ){
      addTextEdit(focusedText.getParent(),
      focusedText.getParent().getX() + 50,
      focusedText.getParent().getY() + 50)
    }


  });



})


function drawImage(stage,imageObj,character){
  var layer = new Kinetic.Layer();


  var group = new Kinetic.Group({
    x: 200,
    y: 10,
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
    height: 500,
    draggable: false
  })

  layer.add(img);
  drawLogo(layer)
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
  console.log(x)
  console.log(y)
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
    x: x - 150,
    y: y -101,
    fontFamily: 'Comic Sans MS',
    fontSize: 20,
    fill: '#000000',
    //text: "placeholder",
    // pasteModal id to support ctrl+v paste.
    pasteModal: "pasteModalArea",
    draggable: true
  });
  console.log(getFullOffset().top)
  console.log(x)
  group.add(newText);

  newText.focus();
  focusedText = newText;

  //focusedText.setPosition({x: -88, y: -35});
  newText.on("click", function(evt) {
    evt.cancelBubble = true;
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

function drawLogo(layer){
  var img = new Kinetic.Image({
    image: $('#logo-pic')[0],
    x: 718,
    y:423,
    width: 80,
    height: 75,
    draggable: false,
    opacity:1
  })
  layer.add(img)
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
  var container = $(".tv");
  return {
    left: container.scrollLeft() - container.offset().left,
    top: container.scrollTop() - container.offset().top
  }
}

function loadCollections(){
  $.ajax( serverDomain + "/collections.json" )
  .done(function(data) {
    $.each(data, function( index, value ) {
      $("#collections").append('<option value="'+ value.id +'">'+ value.name +'</option>')
    });
    $(".bg-holder").animate({"opacity":"1"},1300)
    loadCharacters(data[0]["id"])
    loadBackgrounds(data[0]["id"])
  })
  .fail(function() {
    console.log( "error loading collections" );
  })
}

function loadBackgrounds(id){
  $(".bg-holder").html("")

  $.ajax( serverDomain + "/backgrounds.json?c=" + id)
  .done(function(data) {
    $(".loading-image").remove("")
    $.each(data, function( index, value ) {
      $(".bg-holder").append('<div id="bg_image_'+ index +'" class="background-image" data-fitted= "'+ value.image.image.fitted.url +'" data-tiny= "'+ value.image.image.fitted.url +'"><img crossorigin= "" src="'+ value.image.image.thumb.url +'"></div>')
    });
  })
  .fail(function() {
    console.log( "error loading characters" );
  })

}

function loadCharacters(id){
  $.ajax( serverDomain + "/characters.json?c=" + id )
  .done(function(data) {
    $("#characters").html("")
    $.each(data, function( index, value ) {
      $("#characters").append('<li data-id="'+ value.id +'" class="character">'+ value.name +'</li>')
    });
  })
  .fail(function() {
    console.log( "error loading characters" );
  })
}

function loadPoses(id,characterName){
  $("#poses").html("<p>Loading poses...</p>")
  $.ajax( serverDomain + "/poses.json?c=" + id )
  .done(function(data) {
    $("#poses").html("")
    $.each(data, function( index, value ) {
      $('#poses').append('<div class="pose"><img crossorigin data-thumb="'+ value.image.image.thumb.url +'" data-fitted= "'+ value.image.image.fitted.url +'" class="image" src="'+ value.image.image.tiny.url +'" data-character="'+ characterName +'">\
      <div class="thumb-preview"></div></div>')

    });
  })
  .fail(function() {
    console.log( "error loading characters" );
  })
}


function uploadImage(dataUrl, index){
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
    },
    success: function(response) {
      results[index] = response["data"]["id"]
      console.log(results)
      console.log(results.length)
      if( results.length == stages.length ){
        uploadAlbum()
      }
    }
  });

}


function uploadAlbum(){
  $.ajax({
    url: 'https://api.imgur.com/3/album',
    headers: {
      'Authorization': 'Client-ID d2c784f95f3c2df'
    },
    type: 'POST',
    data: {
      'ids': results,
      'title': comicTitle,
      'layout': 'blog',
      'description': "Made with Comic Maker"
    },
    success: function(response) {
      $("#uploaded").attr("href", 'http://imgur.com/a/' + response["data"]["id"]);
      $("#loading").animate({"width":"100%"},280)
      $("#reddit").attr("href", 'http://www.reddit.com/submit?url=http://imgur.com/a/' + response["data"]["id"] + '&title=' + comicTitle);
      setTimeout(function(){
        $("#loading").animate({"opacity":"0"},2000)
        $("#uploaded,#reddit").slideDown();
        setTimeout(function(){
          $("#imgur").text("Upload to Imgur")
          $("#imgur").removeClass("uploading")
        },750)
      },500)


      setTimeout(function(){
        $("#loading").css('width','0px')
        $("#loading").css('opacity','1')

      },3000)
      console.log('http://imgur.com/a/' + response["data"]["id"])
      uploadedAlbum = true;
    }
  });

}


function inchForward(pixels){
  $("#loading").animate({"width":"+=" + pixels},120)
  var adjustedPixels = Math.floor(Math.random() * (pixels + 11) )
    var loadingWidth = parseFloat($("#loading").css("width").replace(/[^-\d\.]/g, ''))
    var windowWidth = parseFloat($("body").css("width").replace(/[^-\d\.]/g, ''))
  setTimeout(function(){
    if(!uploadedAlbum){
      if( loadingWidth < (windowWidth*0.66) ){
        inchForward(adjustedPixels +6)
      }
      else{
        inchForward(1)
      }
    }
  },155)

}

function loadBackgroundImage(){
  var myImage = new Image();
  $(myImage).one("load", function() {
    //$("#backround").css("background-image", 'url(./css/nyc.png)');
    $("#backround").css("color",'blue');

    console.log(myImage.src)
    $("#background").animate({"opacity":"0.38"},420)
  }).attr("src", "./css/nyc.png");



}
