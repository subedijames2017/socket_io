var socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
socket.on('newMessage', function(message) {
console.log(message);
var li= jQuery('<li></li>');
li.text(`${message.from}:  ${message.text}`);
jQuery('#messages').append(li);
});
socket.on('newLocationMessage',function(message){
  var li= jQuery('<li></li>');
  var a = jQuery('<a target="_blank">My current location</a>')
  li.text(`${message.from}: `);
  a.attr('href',message.url);
  li.append(a);
  jQuery('#messages').append(li);
})
jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();
  socket.emit('createMessage', {
    from: 'User',
    text: jQuery('[name=message]').val()
  }, function () {

  });
});
var geoLocation= jQuery('#location');
geoLocation.on('click',function() {
  if (!navigator.geolocation) {
   return alert('your version of browser doesnt support geoLocation');
  }
  geoLocation.attr('disabled','disabled').text("Sending location..");
  navigator.geolocation.getCurrentPosition(function(position) {
  geoLocation.removeAttr('disabled').text("Send location")
  socket.emit('createUSerLocation',{
  latitude:position.coords.latitude,
  longitude:position.coords.longitude
  }, function () {

  })
},function() {
    geoLocation.removeAttr('disabled').text("Sending location..");
    return alert('your version of browser doesnt support geoLocation');
})
})
