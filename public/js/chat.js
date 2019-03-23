var socket = io();

function scrollToBottom() {
  // Selectors
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child')
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}


socket.on('connect', function () {
  var params = $.deparam(window.location.search);
  console.log(params)
  socket.emit('join', params, function (err) {
    if (err) {
      console.log(err);
      alert(err);
      window.location.href = '/'
    }
    else {
      console.log('no error');
    }
  })
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});
socket.on('updateUserList', function (users) {
  var i = 0;
  var ol = $('<ol></ol>');
  users.forEach(function () {
    ol.append($('<li></li>').text(users[i]))
    i++;
  })
  $('#users').html(ol);
})
socket.on('user image', function (message) {
  if (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#image-template').html();
    var html = Mustache.render(template, {
      image: message.image,
      from: message.from,
      createdAt: formattedTime
    });
    $('#messages').append(html);
  }
});
socket.on('newMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

$('#message-form').on('submit', function (e) {
  e.preventDefault();

  var messageTextbox = $('[name=message]');

  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('')
  });
});
$('[name=image]').on('change', function (e) {
  var file = e.originalEvent.target.files[0]
  reader = new FileReader();
  //When the file has been read...
  reader.onload = function (evt) {
    $('#blah')
      .removeAttr('style')
      .attr('src', evt.target.result)
      .width(50)
      .height(60);
    $('[name=image]').attr("value", evt.target.result);
  };
  //And now, read the image and base64
  file = reader.readAsDataURL(file);
})
$('#image-form').on('submit', function (e) {
  e.preventDefault();
  var imageTextbox = $('[name=image]');
  var image = imageTextbox.attr("value");
  socket.emit('user image', image);
  imageTextbox.val('')
  $('#blah')
    .css("visibility", "hidden")

})

var locationButton = $('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});
