var expect = require('expect');

var {generateMessage,generateLocationMessage} = require('./message');

describe('generateMessage', () => {
  it('should generate correct message object', () => {
    var from = 'Jen';
    var text = 'Some message';
    var message = generateMessage(from, text);

    expect(message.createdAt).toBeTruthy();
    //expect(message).toInclude({from, text});
  });
});

describe('generateLocationMessage',()=>{
  it('should generate correct location message',()=>{
    var from = 'jen',
    latitude = 20,
    longitude = 30,
    url ='https://www.google.com/maps?q=20,30'
    var location= generateLocationMessage(from,latitude,longitude);
    expect(location.url).toBe(url);
  })
})
